export function convertGoogleDriveUrl(url) {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([^/]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
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
