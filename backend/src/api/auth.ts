import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { Hono } from 'hono'
import jwt from 'jsonwebtoken'
import { JWT_SECRET, jwtGuardian } from "../middleware/guardian.js"
import { paramValidation } from '../middleware/validation.js'

const prisma = new PrismaClient()
const auth = new Hono()

// POST /api/auth/login
// body: { email, password }
auth.post('/login', paramValidation(['email', 'password']), async (c) => {
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
// jwtGuardianでContextに型付きでuser情報を格納しているので、c.get('user')で型安全に取得
auth.get('/me', jwtGuardian, async (c) => {
    const userInfo = c.get('user')

    const user = await prisma.user.findUnique({ where: { email: userInfo.email } })
    if (!user) {
        return c.json({ message: 'ユーザーが存在しません' }, 401)
    }
    return c.json({
        email: user.email,
        name: user.name
    })
})

export default auth
