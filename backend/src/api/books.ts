import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'
import { jwtGuardian } from '../middleware/guardian.js'

const prisma = new PrismaClient()
const books = new Hono()
books.use('*', jwtGuardian)

// GET /api/books
books.get('/', async (c) => {
    // 認証済みユーザー情報はc.get('user')で取得可能
    // 書籍一覧取得
    const booksList = await prisma.book.findMany({
        orderBy: { purchasedAt: 'desc' }
    })
    return c.json({ books: booksList })
})

export default books
