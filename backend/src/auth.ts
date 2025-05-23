import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { Hono } from 'hono'
import jwt from 'jsonwebtoken'
import { requireFields } from './validator.js'

const prisma = new PrismaClient()
const auth = new Hono()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-1vvtCHoy7XwpLZCkVfHnM3rVRAf2ipR1cNMwCvdlBQA='

// POST /api/auth/login
// body: { email, password }
auth.post('/login', async (c) => {
    const [ok, missing] = await requireFields(c, ['email', 'password'])
    if (!ok) {
        return c.json({ message: `${missing.join(', ')}は必須です` }, 400)
    }
    const { email, password } = await c.req.json()
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        return c.json({ message: '認証失敗' }, 401)
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
        return c.json({ message: '認証失敗' }, 401)
    }
    const token = jwt.sign({ email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '1h' })
    return c.json({
        token,
        user: {
            email: user.email,
            name: user.name
        }
    })
})

// GET /api/auth/me
auth.get('/me', async (c) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: '認証情報がありません' }, 401)
    }
    const token = authHeader.replace('Bearer ', '')
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        // JWTの型を明示し、emailを安全に取得
        const email = typeof decoded === 'object' && decoded !== null ? decoded.email : undefined
        if (!email) {
            return c.json({ message: '認証失敗' }, 401)
        }
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return c.json({ message: 'ユーザーが存在しません' }, 401)
        }
        return c.json({
            email: user.email,
            name: user.name
        })
    } catch (e) {
        return c.json({ message: '認証失敗' }, 401)
    }
})

export default auth
