export interface YandexTrackShort {
    id: string;
    albumId: string;
    timestamp: string;
}

export interface YandexLikesResponse {
    library: {
        tracks: YandexTrackShort[];
    };
}

export interface YandexTrack {
    id: string;
    title: string;
    artists: { name: string }[];
}

export interface YandexAlbumResponse {
    title: string;
    year: number;
    genre: string;
}

export interface YandexSimilarResponse {
    similarTracks?: { title: string }[];
}

export interface YandexHistoryResponse {
    historyTabs?: YandexHistoryTab[] | null;
}

export interface YandexHistoryTab {
    date?: string | null;
    items?: YandexHistoryGroup[] | null;
}

export interface YandexHistoryGroup {
    context?: YandexHistoryItem | null;
    tracks?: YandexHistoryItem[] | null;
}

export interface YandexHistoryItem {
    type: string;
    data?: {
        itemId?: YandexHistoryItemId | null;
        fullModel?: unknown;
    } | null;
}

export interface YandexHistoryItemId {
    id?: string | null;
    trackId?: string | null;
    albumId?: string | null;
    uid?: string | number | null;
    kind?: string | number | null;
    seeds?: string[] | null;
}

