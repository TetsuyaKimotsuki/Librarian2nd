const TOKEN_KEY = 'jwt_token';

// JWTトークンをlocalStorageに保存
export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

// JWTトークンをlocalStorageから取得
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// JWTトークンをlocalStorageから削除
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
