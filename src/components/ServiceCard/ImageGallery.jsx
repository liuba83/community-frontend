import { useState } from 'react';
import { parseImageUrls } from '../../utils/imageUrl';

export function ImageGallery({ images }) {
  const urls = parseImageUrls(images);
  const [failedImages, setFailedImages] = useState(new Set());

  if (urls.length === 0) return null;

  const visibleImages = urls.filter((url) => !failedImages.has(url)).slice(0, 4);
  const remainingCount = urls.filter((url) => !failedImages.has(url)).length - 4;

  function handleError(url) {
    setFailedImages((prev) => new Set([...prev, url]));
  }

  if (visibleImages.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden mb-3">
      {visibleImages.map((url, i) => (
        <div key={url} className="relative aspect-square bg-gray">
          <img
            src={url}
            alt=""
            className="w-full h-full object-cover"
            onError={() => handleError(url)}
            loading="lazy"
          />
          {i === 3 && remainingCount > 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-lg font-bold">+{remainingCount}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
