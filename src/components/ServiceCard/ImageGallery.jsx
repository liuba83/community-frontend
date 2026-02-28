import { useState } from 'react';
import { parseImageUrls } from '../../utils/imageUrl';

export function ImageGallery({ images }) {
  const urls = parseImageUrls(images);
  const [failedImages, setFailedImages] = useState(new Set());

  if (urls.length === 0) return null;

  const loadedUrls = urls.filter((url) => !failedImages.has(url));

  function handleError(url) {
    setFailedImages((prev) => new Set([...prev, url]));
  }

  if (loadedUrls.length === 0) return null;

  if (loadedUrls.length === 1) {
    return (
      <div className="rounded-[15px] overflow-hidden h-62.5">
        <img
          src={loadedUrls[0]}
          alt=""
          className="w-full h-full object-cover"
          onError={() => handleError(loadedUrls[0])}
          loading="lazy"
        />
      </div>
    );
  }

  // 2+ images: left column (1 tall) + right column (1 or 2 stacked)
  const [first, second, third] = loadedUrls;
  const hasThird = loadedUrls.length >= 3;
  const remainingCount = loadedUrls.length - 3;

  return (
    <div className="flex gap-2.5 h-55.5">
      <div className="flex-1 min-w-0 rounded-[15px] overflow-hidden">
        <img
          src={first}
          alt=""
          className="w-full h-full object-cover"
          onError={() => handleError(first)}
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-2.5">
        <div className={`min-h-0 rounded-[15px] overflow-hidden ${hasThird ? 'flex-1' : 'h-full'}`}>
          <img
            src={second}
            alt=""
            className="w-full h-full object-cover"
            onError={() => handleError(second)}
            loading="lazy"
          />
        </div>
        {hasThird && (
          <div className="flex-1 min-h-0 relative rounded-[15px] overflow-hidden">
            <img
              src={third}
              alt=""
              className="w-full h-full object-cover"
              onError={() => handleError(third)}
              loading="lazy"
            />
            {remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-2xl font-normal">+{remainingCount}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
