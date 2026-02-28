export function isValidURL(url) {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function getSafeHref(url) {
  return isValidURL(url) ? url : '#';
}

export function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}
