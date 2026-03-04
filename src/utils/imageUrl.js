export function convertGoogleDriveUrl(url) {
  if (!url) return null;
  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w1000`;
  }
  const openMatch = url.match(/[?&]id=([^&]+)/);
  if (openMatch) {
    return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=w1000`;
  }
  return url;
}

export function parseImageUrls(imagesField) {
  if (!imagesField) return [];
  return imagesField
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
    .map(convertGoogleDriveUrl);
}
