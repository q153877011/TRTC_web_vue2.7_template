
/**
 * Determine if a string is a number
 * @returns boolean
 */
export function checkNumber(roomId: string) {
  const reg = /^\d+$/;
  return reg.test(roomId);
}

/**
 * Gets the value of the specified key from window.location.href.
 * @param {*} key The key to get
 * @returns The value corresponding to the key specified in window.location.href.
 * @example
 * const value = getUrlParam(key);
 */
export function getUrlParam(key: string) {
  const url = window?.location.href.replace(/^[^?]*\?/, '');
  const regexp = new RegExp(`(^|&)${key}=([^&#]*)(&|$|)`, 'i');
  const paramMatch = url?.match(regexp);

  return paramMatch ? paramMatch[2] : null;
}

/**
 * Get Language
 * @returns language
 */
export function getLanguage() {
  let language =localStorage.getItem('tuiRoom-language') || 'en-US';
  language = language.replace(/_/, '-').toLowerCase();
  const isZh = language.startsWith('zh');
  language = isZh ? 'zh-CN' : 'en-US';

  return language;
}

/**
 * Get Theme
 * @returns Theme
 */
export function getTheme() {
  let storedTheme = localStorage.getItem('tuiRoom-currentTheme') || 'LIGHT';

  if (storedTheme === 'white') {
    storedTheme = 'LIGHT';
  } else if (storedTheme === 'black') {
    storedTheme = 'DARK';
  }

  return storedTheme;
}
