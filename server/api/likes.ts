import { yandexFetch } from '@/api/client.js'
import type {YandexLikesResponse, YandexTrackShort} from "@/api/types.js";

export async function fetchLikes(): Promise<YandexTrackShort[]> {
    const uid = Number(process.env.YM_UID);

    if (!uid) {
        throw new Error('UID не найден в .env');
    }

    const data = await yandexFetch(`/users/${uid}/likes/tracks`) as YandexLikesResponse;

    return data.library?.tracks ?? [];
}
