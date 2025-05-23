import { Hono } from 'hono'
import auth from './auth.js'
import books from './books.js'

export const app = new Hono()

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