import { fetch as wreqFetch } from 'node-wreq'

export async function yandexFetch(
  path: string,
  options?: { auth?: boolean },
): Promise<unknown> {
  const token = process.env.YM_TOKEN

  const useAuth = options?.auth !== false

  if (useAuth && !token) {
    throw new Error('Токен не найден в .env')
  }

  const headers: Record<string, string> = {}

  if (useAuth) {
    headers.Authorization = `OAuth ${token}`
  }

  const response = await wreqFetch(`https://api.music.yandex.net${path}`, {
    browser: 'chrome_137',
    timeout: 15_000,
    headers,
  })

  if (!response.ok) {
    const retryAfter = response.headers.get('retry-after')
    const hint =
      response.status === 403
        ? 'Доступ запрещён. Причиной могут быть ограничения метода, авторизации или антибот-защита.'
        : response.status === 429
          ? `Слишком много запросов.${retryAfter ? ` Retry-After: ${retryAfter}.` : ''}`
          : 'Запрос отклонён.'
    throw new Error(
      `GET ${path}: HTTP ${response.status}. ${hint} Выполнение остановлено без повторов.`,
    )
  }

  const data: unknown = await response.json()

  if (!data || typeof data !== 'object') {
    throw new Error(`GET ${path}: ответ API не является объектом.`)
  }

  if ('error' in data) {
    throw new Error(
      `GET ${path}: API вернул ошибку: ${JSON.stringify((data as any).error)}`,
    )
  }

  return 'result' in data ? data.result : data
}
