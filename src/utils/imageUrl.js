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

function getCloudinaryUrl(url) {
  return url.replace('/upload/', '/upload/f_auto,q_auto,w_1200/');
}

export function parseImageUrls(imagesField) {
  if (!imagesField) return [];
  return imagesField
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) =>
      url.startsWith('https://res.cloudinary.com/')
        ? getCloudinaryUrl(url)
        : convertGoogleDriveUrl(url)
    );
}
