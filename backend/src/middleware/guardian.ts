import type { MiddlewareHandler } from 'hono';
import jwt from 'jsonwebtoken';

// JWTシークレットの一元管理用
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-1vvtCHoy7XwpLZCkVfHnM3rVRAf2ipR1cNMwCvdlBQA=';

/**
 * JWT認証ミドルウェア
 * - Authorization: Bearer <token> を検証
 * - 成功時: c.set('user', { email, name, role }) でユーザー情報を格納
 * - 失敗時: 401 Unauthorized
 */
export const jwtGuardian: MiddlewareHandler = async (c, next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: '認証情報がありません' }, 401)
    }
    const token = authHeader.replace('Bearer ', '')
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        if (typeof decoded !== 'object' || !decoded || !('email' in decoded)) {
            return c.json({ message: '認証失敗' }, 401)
        }
        // email, name, role をContextに格納
        c.set('user', {
            email: decoded.email,
            name: decoded.name,
            role: decoded.role
        })
        await next()
    } catch (e) {
        return c.json({ message: '認証失敗' }, 401)
    }
}

// Hono Context拡張: 'user'キーで型安全にユーザー情報を取得できるようにする
declare module 'hono' {
    interface ContextVariableMap {
        user: { email: string; name: string; role: string }
    }
}
