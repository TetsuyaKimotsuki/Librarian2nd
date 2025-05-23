import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { Hono } from 'hono'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const auth = new Hono()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// POST /api/auth/login
// body: { email, password }
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  if (!email || !password) {
    return c.json({ message: 'メールアドレスとパスワードは必須です' }, 400)
  }
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return c.json({ message: '認証失敗' }, 401)
  }
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return c.json({ message: '認証失敗' }, 401)
  }
  const token = jwt.sign({ email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '1h' })
  return c.json({ token })
})

export default auth
