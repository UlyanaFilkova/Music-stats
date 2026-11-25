import { fetch as wreqFetch, type WreqInit } from 'node-wreq';

interface ApiResponse {
    ok: boolean;
    status: number;
    headers: { get(name: string): string | null };
    json(): Promise<unknown>;
}
type ApiFetch = (url: string, options: WreqInit) => Promise<ApiResponse>;

// Все методы используют один транспорт. Автоматических повторов нет.
export function createMusicApi(token: string, fetcher: ApiFetch = wreqFetch) {
    return async function get<T>(path: string): Promise<T> {
        const response = await fetcher(`https://api.music.yandex.net${path}`, {
            browser: 'chrome_137',
            headers: { Authorization: `OAuth ${token}` },
            retry: 0,
            redirect: 'manual',
            throwHttpErrors: false,
            timeout: 15_000,
        });

        if (!response.ok) {
            const retryAfter = response.headers.get('retry-after');
            const hint = response.status === 403
                ? 'Доступ запрещён. Причиной могут быть ограничения метода, авторизации или антибот-защита.'
                : response.status === 429
                    ? `Слишком много запросов.${retryAfter ? ` Retry-After: ${retryAfter}.` : ''}`
                    : 'Запрос отклонён.';
            // Не выводим тело ошибки: оно может содержать капчу или данные сессии.
            throw new Error(`GET ${path}: HTTP ${response.status}. ${hint} Выполнение остановлено без повторов.`);
        }

        const data: unknown = await response.json();
        if (!data || typeof data !== 'object' || 'error' in data || !('result' in data)) {
            throw new Error(`GET ${path}: ответ API не содержит успешного result.`);
        }
        return data.result as T;
    };
}
