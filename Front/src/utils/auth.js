import Cookies from 'js-cookie';

// const TokenKey = 'Admin-Token';

// export function getToken() {
//   return Cookies.get(TokenKey);
// }

// export function setToken(token) {
//   return Cookies.set(TokenKey, token);
// }

// export function removeToken() {
//   return Cookies.remove(TokenKey);
// }

const TokenKey = 'User-Token';

export function getToken() {
	return Cookies.get(TokenKey);
	// return sessionStorage.getItem(TokenKey) || ''
}

export function setToken(token) {
	//   const fiveHours = new Date(new Date().getTime() + 5 * 60 * 60 * 1000); // 5小时后过期
	// const oneminute = new Date(new Date().getTime() + 30 * 1000); // 30s后过期
	let now = new Date();
	let tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // 第二天凌晨过期
	return Cookies.set(TokenKey, token, { expires: tomorrow });
	// sessionStorage.setItem(TokenKey, token)
	//   return '';
}

export function removeToken() {
	return Cookies.remove(TokenKey);
	// return sessionStorage.removeItem(TokenKey)
}
