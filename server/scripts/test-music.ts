import 'dotenv/config';
import { yandexFetch } from '@/api/client.js';
import { fetchLikes } from '@/api/likes.js';
import type {
    YandexAlbumResponse,
    YandexLikesResponse,
    YandexSimilarResponse,
    YandexTrack,
} from '@/api/types.js';

async function test() {

    try {
        // 1. Получаем лайкнутые треки
        const tracks = await fetchLikes();
        console.log(`Лайкнутых треков: ${tracks.length}`);

        tracks.slice(0, 5).forEach((item, i) => {
            console.log(`${i + 1}. ID трека: ${item.id}`);
        });

        // 2. Получаем полную информацию о первых 5 треках
        const ids = tracks.slice(0, 5).map((t) => t.id).join(',');

        if (ids) {
            const fullTracks = await yandexFetch(`/tracks?trackIds=${encodeURIComponent(ids)}`) as YandexTrack[];

            console.log('\nПолная информация о первых 5 треках:');
            fullTracks.forEach((track, i) => {
                const title = track?.title || 'Без названия';
                const artists = track?.artists?.map((a) => a.name).join(', ') || 'Неизвестный исполнитель';
                console.log(`${i + 1}. ${title} — ${artists}`);
            });

            // 3. Проверяем альбом первого трека
            const firstAlbumId = tracks[0]?.albumId;
            if (firstAlbumId) {
                console.log('\n--- Информация об альбоме первого трека ---');
                const albumData = await yandexFetch(`/albums/${encodeURIComponent(firstAlbumId)}`) as YandexAlbumResponse;
                console.log('Альбом:', albumData.title);
                console.log('Год:', albumData.year);
                console.log('Жанр:', albumData.genre);
            }

            // 4. Проверяем похожие треки для первого трека
            const firstTrackId = tracks[0]?.id;
            if (firstTrackId) {
                console.log('\n--- Похожие треки для первого трека ---');
                const similarData = await yandexFetch(`/tracks/${encodeURIComponent(firstTrackId)}/similar`) as YandexSimilarResponse;
                const similar = similarData.similarTracks?.slice(0, 3) || [];
                similar.forEach((t, i) => console.log(`${i + 1}. ${t.title}`));
            }

        }

        // История не зависит от наличия лайков. Сохраняем ответ без предположений
        // о количестве событий и времени прослушивания: это сгруппированная история.
        const history = await yandexFetch('/music-history?fullModelsCount=5');
        console.log('\nИстория получена:');
        console.log(JSON.stringify(history, null, 2));

    } catch (error: unknown) {
        console.error('Ошибка:', error instanceof Error ? error.message : 'Неизвестная ошибка');
        process.exitCode = 1;
    }
}

test();
