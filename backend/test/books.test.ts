import { describe, expect, it } from 'vitest'
import { app } from '../src/index.js'

// テスト用ユーザー情報
const validUser = {
    email: 'hanako.suzuki@ogis-ri.co.jp',
    password: 'hanako123',
    name: '鈴木 花子'
}

// JWT取得用のヘルパー
async function getToken() {
    const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: validUser.email,
            password: validUser.password
        })
    })
    const res = await app.fetch(req)
    const body = await res.json()
    return body.token
}

describe('GET /api/books', () => {
    it('認証ヘッダがない場合は401を返す', async () => {
        const req = new Request('http://localhost/api/books', {
            method: 'GET'
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(401)
    })

    it('不正なトークンの場合は401を返す', async () => {
        const req = new Request('http://localhost/api/books', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer invalidtoken' }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(401)
    })

    it('正しいトークンの場合は書籍一覧を返す', async () => {
        const token = await getToken()
        const req = new Request('http://localhost/api/books', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.books)).toBe(true)
        expect(body.books.length).toBeGreaterThanOrEqual(1)
        expect(body.books[0]).toHaveProperty('title')
        expect(body.books[0]).toHaveProperty('author')
    })
})
