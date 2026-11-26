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

