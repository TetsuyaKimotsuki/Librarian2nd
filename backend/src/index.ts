import { Hono } from 'hono'
import auth from './api/auth.js'
import books from './api/books.js'
import { errorHandler } from './api/errorHandler.js'

export const app = new Hono()
app.onError(errorHandler)

app.get('/', (c) => {
  return c.text('Hello Node.js/Hono!')
})

app.route('/api/auth', auth)
app.route('/api/books', books)

// サーバー起動はテスト以外のときのみ
if (process.env.NODE_ENV !== 'test') {
  import('@hono/node-server').then(({ serve }) => {
    serve({ fetch: app.fetch, port: 3000 }, (info) => {
      console.log(`Server is running on http://localhost:${info.port}`)
    })
  })
}