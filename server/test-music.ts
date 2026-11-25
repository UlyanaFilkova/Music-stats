import 'dotenv/config';
import { createMusicApi } from './music-api.js';

// --- Типы для ответов API ---

interface YandexTrackShort {
    id: string;
    albumId: string;
    timestamp: string;
}

interface YandexLikesResponse {
    library: {
        tracks: YandexTrackShort[];
    };
}

interface YandexTrack {
    id: string;
    title: string;
    artists: { name: string }[];
}

interface YandexAlbumResponse {
    title: string;
    year: number;
    genre: string;
}

interface YandexSimilarResponse {
    similarTracks?: { title: string }[];
}

// --- Основная функция ---

async function test() {
    const token = process.env.YM_TOKEN;
    const uid = process.env.YM_UID;

    if (!token || !uid) {
        console.error('Токен или UID не найдены в .env');
        process.exitCode = 1;
        return;
    }

    const get = createMusicApi(token);

    try {
        // 1. Получаем лайкнутые треки
        const data = await get<YandexLikesResponse>(`/users/${encodeURIComponent(uid)}/likes/tracks`);
        const tracks = data.library?.tracks || [];
        console.log(`Лайкнутых треков: ${tracks.length}`);

        tracks.slice(0, 5).forEach((item, i) => {
            console.log(`${i + 1}. ID трека: ${item.id}`);
        });

        // 2. Получаем полную информацию о первых 5 треках
        const ids = tracks.slice(0, 5).map((t) => t.id).join(',');

        if (ids) {
            const fullTracks = await get<YandexTrack[]>(`/tracks?trackIds=${encodeURIComponent(ids)}`);

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
                const albumData = await get<YandexAlbumResponse>(`/albums/${encodeURIComponent(firstAlbumId)}`);
                console.log('Альбом:', albumData.title);
                console.log('Год:', albumData.year);
                console.log('Жанр:', albumData.genre);
            }

            // 4. Проверяем похожие треки для первого трека
            const firstTrackId = tracks[0]?.id;
            if (firstTrackId) {
                console.log('\n--- Похожие треки для первого трека ---');
                const similarData = await get<YandexSimilarResponse>(`/tracks/${encodeURIComponent(firstTrackId)}/similar`);
                const similar = similarData.similarTracks?.slice(0, 3) || [];
                similar.forEach((t, i) => console.log(`${i + 1}. ${t.title}`));
            }

        }

        // История не зависит от наличия лайков. Сохраняем ответ без предположений
        // о количестве событий и времени прослушивания: это сгруппированная история.
        const history = await get<unknown>('/music-history?fullModelsCount=5');
        console.log('\nИстория получена:');
        console.log(JSON.stringify(history, null, 2).slice(0, 2000));

    } catch (error: unknown) {
        console.error('Ошибка:', error instanceof Error ? error.message : 'Неизвестная ошибка');
        process.exitCode = 1;
    }
}

test();
