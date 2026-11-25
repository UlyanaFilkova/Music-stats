import 'dotenv/config';
import { fetch as wreqFetch } from 'node-wreq'; // 1. Импортируем fetch из node-wreq

async function test() {
    const token = process.env.YM_TOKEN;
    const uid = process.env.YM_UID;

    if (!token || !uid) {
        console.error('Токен или UID не найдены в .env');
        return;
    }

    try {
        // 2. Используем wreqFetch и указываем браузер для имитации
        const response = await wreqFetch(`https://api.music.yandex.net/users/${uid}/likes/tracks`, {
            browser: 'chrome_137', // или 'chrome_124' и другие доступные профили
            headers: {
                'Authorization': `OAuth ${token}`,
            },
        });

        if (!response.ok) {
            console.error('Ошибка HTTP:', response.status, response.statusText);
            const text = await response.text();
            console.error('Тело ответа:', text);
            return;
        }

        const data = await response.json();
        const tracks = data?.result?.library?.tracks || [];
        console.log(`Лайкнутых треков: ${tracks.length}`);

        tracks.slice(0, 5).forEach((item: any, i: number) => {
            console.log(`${i + 1}. ID трека: ${item.id}`);
        });

        // Берём первые 5 ID
        const ids = tracks.slice(0, 5).map((t: any) => t.id).join(',');

        const tracksResponse = await wreqFetch(`https://api.music.yandex.net/tracks?trackIds=${ids}`, {
            browser: 'chrome_137',
            headers: {
                'Authorization': `OAuth ${token}`,
            },
        });

        if (!tracksResponse.ok) {
            console.error('Ошибка при получении треков:', tracksResponse.status);
        } else {
            const tracksData = await tracksResponse.json();
            const fullTracks = tracksData?.result || [];

            console.log('\nПолная информация о первых 5 треках:');
            fullTracks.forEach((track: any, i: number) => {
                const title = track?.title || 'Без названия';
                const artists = track?.artists?.map((a: any) => a.name).join(', ') || 'Неизвестный исполнитель';
                console.log(`${i + 1}. ${title} — ${artists}`);
            });
        }

    } catch (error: any) {
        console.error('Ошибка:', error?.message || error);
    }
}

test();