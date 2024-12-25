// import Cookies from 'js-cookie';

const TokenKey = 'User-Token';

export function getToken(): string {
  // return Cookies.get(TokenKey);
  return sessionStorage.getItem(TokenKey) || '';
}

export function setToken(token: string): string {
  // const fiveHours = new Date(new Date().getTime() + 5 * 60 * 60 * 1000); // 5小时后过期
  // return Cookies.set(TokenKey, token, { expires: fiveHours });
  sessionStorage.setItem(TokenKey, token);
  return '';
}

export function removeToken(): void {
  // return Cookies.remove(TokenKey);
  return sessionStorage.removeItem(TokenKey);
}
