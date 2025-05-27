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
    it('キーワード検索', async () => {
        const token = await getToken();
        const req = new Request('http://localhost/api/books?keyword=リーダブル', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const res = await app.fetch(req);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body.books)).toBe(true);
        expect(body.books.length).toBeGreaterThan(0);
        body.books.forEach((book: any) => {
            expect(book.title).toContain('リーダブル');
        });
    });

    it('購入日from-to検索', async () => {
        const token = await getToken();
        const req = new Request('http://localhost/api/books?purchased_from=2024-01-01&purchased_to=2024-12-31', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const res = await app.fetch(req);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body.books)).toBe(true);
        expect(body.books.length).toBeGreaterThan(0);
        body.books.forEach((book: any) => {
            expect(new Date(book.purchasedAt).getFullYear()).toBe(2024);
        });
    });

    it('ページング', async () => {
        const token = await getToken();
        const req = new Request('http://localhost/api/books?page=2&per_page=10', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const res = await app.fetch(req);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body.books)).toBe(true);
        expect(body.books.length).toBe(10);
        expect(body.page).toBe(2);
        expect(body.per_page).toBe(10);
    });

    it('purchased_fromのバリデーション', async () => {
        const token = await getToken();
        const req = new Request('http://localhost/api/books?purchased_from=2024-13-01', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const res = await app.fetch(req);
        expect(res.status).toBe(400);
    });

    it('purchased_toのバリデーション', async () => {
        const token = await getToken();
        const req = new Request('http://localhost/api/books?purchased_to=2024-13-01', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const res = await app.fetch(req);
        expect(res.status).toBe(400);
    });

    it('pageのバリデーション', async () => {
        const token = await getToken();
        const req = new Request('http://localhost/api/books?page=1001', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const res = await app.fetch(req);
        expect(res.status).toBe(400);
    });

    it('per_pageのバリデーション', async () => {
        const token = await getToken();
        const req = new Request('http://localhost/api/books?per_page=101', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const res = await app.fetch(req);
        expect(res.status).toBe(400);
    });
})
