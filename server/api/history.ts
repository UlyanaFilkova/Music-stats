import { yandexFetch } from '@/api/client.js'
import type { YandexHistoryResponse } from '@/api/types.js'

export async function fetchHistory(): Promise<YandexHistoryResponse> {
  return (await yandexFetch(
    '/music-history?fullModelsCount=5',
  )) as YandexHistoryResponse
}
