import assert from 'node:assert/strict';
import test from 'node:test';
import { createMusicApi } from './music-api.js';

test('history uses the same authenticated transport and unwraps result', async () => {
    const history = { historyTabs: [{ date: '2026-11-25', items: [] }] };
    const get = createMusicApi('test-token', async (url, options) => {
        assert.equal(url, 'https://api.music.yandex.net/music-history?fullModelsCount=5');
        assert.deepEqual(options.headers, { Authorization: 'OAuth test-token' });
        assert.equal(options.browser, 'chrome_137');
        assert.equal(options.retry, 0);
        assert.equal(options.redirect, 'manual');
        assert.equal(options.throwHttpErrors, false);
        return Response.json({ result: history });
    });
    assert.deepEqual(await get('/music-history?fullModelsCount=5'), history);
});

for (const status of [403, 429]) {
    test(`HTTP ${status} stops the sequence without retries or logging response data`, async () => {
        let calls = 0;
        const get = createMusicApi('test-token', async () => {
            calls++;
            return new Response('private-session-data', {
                status,
                headers: { 'retry-after': '60' },
            });
        });
        await assert.rejects(async () => {
            await get('/music-history?fullModelsCount=5');
            await get('/tracks?trackIds=1');
        }, (error: Error) => {
            assert.match(error.message, new RegExp(`HTTP ${status}`));
            assert.doesNotMatch(error.message, /private-session-data|test-token/);
            if (status === 429) assert.match(error.message, /Retry-After: 60/);
            return true;
        });
        assert.equal(calls, 1);
    });
}

test('API error envelopes and unexpected successful responses are rejected', async () => {
    for (const body of [{ error: { name: 'access-denied' } }, {}, null]) {
        const get = createMusicApi('test-token', async () => Response.json(body));
        await assert.rejects(get('/music-history'), /result/);
    }
});
