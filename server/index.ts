import express from 'express'
import { HOST, PORT } from '@/config.js'
import { fetchLikes } from '@/api/likes.js'

const app = express()

app.get('/api/likes', async (_req, res) => {
  try {
    const tracks = await fetchLikes()
    res.json(tracks)
  } catch (error: unknown) {
    console.error('Не удалось получить лайки:', error)
    res.status(500).json({ error: 'Не удалось получить список лайков' })
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
