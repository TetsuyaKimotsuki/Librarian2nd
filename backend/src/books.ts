import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const books = new Hono()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-1vvtCHoy7XwpLZCkVfHnM3rVRAf2ipR1cNMwCvdlBQA='

// GET /api/books
books.get('/', async (c) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: '認証情報がありません' }, 401)
    }
    const token = authHeader.replace('Bearer ', '')
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        const email = typeof decoded === 'object' && decoded !== null ? decoded.email : undefined
        if (!email) {
            return c.json({ message: '認証失敗' }, 401)
        }
        // 書籍一覧取得
        const booksList = await prisma.book.findMany({
            orderBy: { purchasedAt: 'desc' }
        })
        return c.json({ books: booksList })
    } catch (e) {
        return c.json({ message: '認証失敗' }, 401)
    }
})

export default books
