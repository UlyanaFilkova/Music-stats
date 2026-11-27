import express from 'express'
import { HOST, PORT } from '@/config.js'
import { fetchLikes } from '@/api/likes.js'
import { fetchHistory } from '@/api/history.js'
import { loadFromFile, saveToFile } from '@/storage/fileStorage.js'
import { type YandexTrackShort, type YandexHistoryResponse } from '@/api/types.js'

const app = express()

app.get('/api/likes', async (_req, res) => {
  try {
    const likesFromFile = await loadFromFile<YandexTrackShort[]>('data/likes.json')
    if (likesFromFile !== null) {
      res.json(likesFromFile)
      return
    }

    const tracks = await fetchLikes()
    await saveToFile('data/likes.json', tracks)
    res.json(tracks)
  } catch (error: unknown) {
    console.error('Не удалось получить лайки:', error)
    res.status(500).json({ error: 'Не удалось получить список лайков' })
  }
})

app.get('/api/history', async (_req, res) => {
  try {
    const historyFromFile = await loadFromFile<YandexHistoryResponse>('data/history.json')
    if (historyFromFile !== null) {
      res.json(historyFromFile)
      return
    }

    const history = await fetchHistory()
    await saveToFile('data/history.json', history)
    res.json(history)
  } catch (error: unknown) {
    console.error('Не удалось получить историю:', error)
    res.status(500).json({ error: 'Не удалось получить историю' })
  }
})

app.listen(PORT, HOST, (error) => {
  if (error) {
    console.error('Не удалось запустить сервер:', error)
    process.exitCode = 1
    return
  }

  console.log(`Сервер запущен: http://${HOST}:${PORT}`)
})
