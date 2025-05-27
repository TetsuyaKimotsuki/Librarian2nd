import { beforeAll, describe, expect, it } from 'vitest'
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

describe('GET /api/books/all', () => {
    it('認証ヘッダがない場合は401を返す', async () => {
        const req = new Request('http://localhost/api/books/all', {
            method: 'GET'
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(401)
    })

    it('不正なトークンの場合は401を返す', async () => {
        const req = new Request('http://localhost/api/books/all', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer invalidtoken' }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(401)
    })

    it('正しいトークンの場合は書籍一覧を返す', async () => {
        const token = await getToken()
        const req = new Request('http://localhost/api/books/all', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.books)).toBe(true)
        expect(body.books.length).toBe(30)
        expect(body.books[0]).toHaveProperty('title')
        expect(body.books[0]).toHaveProperty('author')
        expect(body.books[0]).toHaveProperty('isbn')
        expect(body.books[0]).toHaveProperty('location')
        expect(body.books[0]).toHaveProperty('memo')
        expect(body.books[0]).toHaveProperty('purchasedAt')
        expect(body.books[0]).toHaveProperty('registeredBy')
    })
})

describe('GET /api/books', () => {
    let token: string
    beforeAll(async () => {
        token = await getToken()
    })

    // --- 正常系 ---
    it('キーワード検索（keywordパラメータ）で部分一致する書籍のみ返す', async () => {
        const req = new Request('http://localhost/api/books?keyword=山田', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.books)).toBe(true)
        expect(body.books.length).toBeGreaterThan(0)
        for (const book of body.books) {
            expect(
                book.title.includes('山田') ||
                book.author.includes('山田') ||
                book.memo.includes('山田') ||
                book.registeredBy === 'taro.yamada@sigo-ri.co.jp' // registeredByから「山田 太郎」を引ける場合はこうなるはず
            ).toBe(true)
        }
    })

    it('キーワードが空文字の場合は全件返す', async () => {
        const req = new Request('http://localhost/api/books?per_page=100&keyword=', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.books)).toBe(true)
        expect(body.total).toBe(body.books.length)
    })

    it('購入日from-to検索（purchased_from, purchased_to）で範囲内のみ返す', async () => {
        const req = new Request('http://localhost/api/books?purchased_from=2024-04-01&purchased_to=2024-04-30', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        for (const book of body.books) {
            expect(book.purchasedAt >= '2024-04-01').toBe(true)
            expect(book.purchasedAt <= '2024-04-30').toBe(true)
        }
    })

    it('全パラメータ省略時はデフォルト値で正常に返す', async () => {
        const req = new Request('http://localhost/api/books', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.page).toBe(1)
        expect(body.per_page).toBe(10)
        expect(Array.isArray(body.books)).toBe(true)
    })

    it('ページング指定時に正しい件数・ページ番号・per_pageが返る', async () => {
        const req = new Request('http://localhost/api/books?page=2&per_page=5', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.page).toBe(2)
        expect(body.per_page).toBe(5)
        expect(body.books.length).toBeLessThanOrEqual(5)
    })

    it('検索条件に一致しない場合は空リストを返す', async () => {
        const req = new Request('http://localhost/api/books?keyword=存在しないキーワード', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.books)).toBe(true)
        expect(body.books.length).toBe(0)
        expect(body.total).toBe(0)
    })

    it('購入日範囲指定なしの場合は全期間が対象になる', async () => {
        const req = new Request('http://localhost/api/books', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        // purchasedAtが2000-01-01～2099-12-31の範囲内
        for (const book of body.books) {
            expect(book.purchasedAt >= '2000-01-01').toBe(true)
            expect(book.purchasedAt <= '2099-12-31').toBe(true)
        }
    })

    it('レスポンスのbooks配列に必要なプロパティが全て含まれる', async () => {
        const req = new Request('http://localhost/api/books', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        for (const book of body.books) {
            expect(book).toHaveProperty('id')
            expect(book).toHaveProperty('title')
            expect(book).toHaveProperty('author')
            expect(book).toHaveProperty('isbn')
            expect(book).toHaveProperty('location')
            expect(book).toHaveProperty('memo')
            expect(book).toHaveProperty('purchasedAt')
            expect(book).toHaveProperty('registeredBy')
            expect(book).toHaveProperty('updatedAt')
        }
    })

    it('total, page, per_pageが正しく返る', async () => {
        const req = new Request('http://localhost/api/books?page=1&per_page=3', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(typeof body.total).toBe('number')
        expect(body.page).toBe(1)
        expect(body.per_page).toBe(3)
    })

    // --- 異常系 ---
    const invalidParams = [
        // purchased_from, purchased_to
        { name: 'purchased_fromがYYYY-MM-DD形式でない場合は400を返す', qs: 'purchased_from=20240401', msg: 'purchased_from' },
        { name: 'purchased_toがYYYY-MM-DD形式でない場合は400を返す', qs: 'purchased_to=20240401', msg: 'purchased_to' },
        { name: 'purchased_fromが不正な日付の場合は400を返す', qs: `purchased_from=2099-13-31`, msg: 'purchased_from' },
        { name: 'purchased_toが不正な日付の場合は400を返す', qs: `purchased_to=2000-01-00`, msg: 'purchased_to' },
        { name: 'purchased_from > purchased_to の場合は400を返す', qs: 'purchased_from=2024-05-01&purchased_to=2024-04-01', msg: 'purchased_from' },
        // page
        { name: 'pageが1未満の場合は400を返す', qs: 'page=0', msg: 'page' },
        { name: 'pageが数値でない場合は400を返す', qs: 'page=abc', msg: 'page' },
        { name: 'pageが小数の場合は400を返す', qs: 'page=1.5', msg: 'page' },
        { name: 'pageが1000を超える場合は400を返す', qs: 'page=1001', msg: 'page' },
        // per_page
        { name: 'per_pageが1未満の場合は400を返す', qs: 'per_page=0', msg: 'per_page' },
        { name: 'per_pageが数値でない場合は400を返す', qs: 'per_page=abc', msg: 'per_page' },
        { name: 'per_pageが小数の場合は400を返す', qs: 'per_page=2.5', msg: 'per_page' },
        { name: 'per_pageが100を超える場合は400を返す', qs: 'per_page=101', msg: 'per_page' },
    ]

    it.each(invalidParams)('$name', async ({ qs, msg }) => {
        const req = new Request(`http://localhost/api/books?${qs}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const res = await app.fetch(req)
        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body).toHaveProperty('message')
        expect(JSON.stringify(body.message)).toContain(msg)
    })
})
