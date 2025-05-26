import { describe, expect, it } from 'vitest'
import { app } from '../src/index.js'

// テスト用ユーザー情報
const validUser = {
    email: 'hanako.suzuki@sigo-ri.co.jp',
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

describe('POST /api/auth/login', () => {
    it.each([
        { name: 'emailが未指定の場合は400を返す', body: { password: validUser.password } },
        { name: 'passwordが未指定の場合は400を返す', body: { email: validUser.email } },
        { name: 'emailとpasswordが両方未指定の場合も400を返す', body: {} },
    ])('$name', async ({ body }) => {
        const req = new Request('http://localhost/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(400)
        const resBody = await res.json()
        expect(resBody.message).toMatch(/必須/)
    })

    it('存在しないユーザーの場合は401を返す', async () => {
        const req = new Request('http://localhost/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'notfound@sigo-ri.co.jp',
                password: 'wrong'
            })
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(401)
    })

    it('パスワードが間違っている場合は401を返す', async () => {
        const req = new Request('http://localhost/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: validUser.email,
                password: 'wrongpassword'
            })
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(401)
    })

    it('正しい認証情報の場合はtokenとuser情報を返す', async () => {
        const req = new Request('http://localhost/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: validUser.email,
                password: validUser.password
            })
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body).toHaveProperty('token')
        expect(body.user).toMatchObject({
            email: validUser.email,
            name: validUser.name
        })
    })
})

describe('GET /api/auth/me', () => {
    it('認証ヘッダがない場合は401を返す', async () => {
        const req = new Request('http://localhost/api/auth/me', {
            method: 'GET'
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(401)
    })

    it('不正なトークンの場合は401を返す', async () => {
        const req = new Request('http://localhost/api/auth/me', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer invalidtoken' }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(401)
    })

    it('正しいトークンの場合はユーザー情報を返す', async () => {
        const token = await getToken()
        const req = new Request('http://localhost/api/auth/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body).toMatchObject({
            email: validUser.email,
            name: validUser.name
        })
    })
})
