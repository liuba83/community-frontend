function getCloudinaryUrl(url) {
  return url.replace('/upload/', '/upload/f_auto,q_auto,w_1200/');
}

export function parseImageUrls(imagesField) {
  if (!imagesField) return [];
  return imagesField
    .split(',')
    .map((url) => url.trim())
    .filter((url) => url.startsWith('https://res.cloudinary.com/'))
    .map(getCloudinaryUrl);
}
