import { useState, useEffect, useCallback } from 'react';
import { parseImageUrls } from '../../utils/imageUrl';

function Lightbox({ urls, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);

  const prev = useCallback(() => setIndex((i) => (i - 1 + urls.length) % urls.length), [urls.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % urls.length), [urls.length]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-lg"
        onClick={onClose}
      >
        ✕
      </button>

      <img
        src={urls[index]}
        alt=""
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />

      {urls.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-2xl"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            ‹
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-2xl"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            ›
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {urls.map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/40'}`}
                onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ImageGallery({ images }) {
  const urls = parseImageUrls(images);
  const [failedImages, setFailedImages] = useState(new Set());
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (urls.length === 0) return null;

  const loadedUrls = urls.filter((url) => !failedImages.has(url));

  function handleError(url) {
    console.error('[images] failed to load:', url);
    setFailedImages((prev) => new Set([...prev, url]));
  }

  if (loadedUrls.length === 0) return null;

  const open = (i) => setLightboxIndex(i);
  const close = () => setLightboxIndex(null);

  if (loadedUrls.length === 1) {
    return (
      <>
        <div className="rounded-[15px] overflow-hidden h-62.5 cursor-pointer" onClick={() => open(0)}>
          <img
            src={loadedUrls[0]}
            alt=""
            className="w-full h-full object-cover"
            onError={() => handleError(loadedUrls[0])}
            loading="lazy"
          />
        </div>
        {lightboxIndex !== null && <Lightbox urls={loadedUrls} startIndex={lightboxIndex} onClose={close} />}
      </>
    );
  }

  // 2+ images: left column (1 tall) + right column (1 or 2 stacked)
  const [first, second, third] = loadedUrls;
  const hasThird = loadedUrls.length >= 3;
  const remainingCount = loadedUrls.length - 3;

  return (
    <>
      <div className="flex gap-2.5 h-55.5">
        <div className="flex-1 min-w-0 rounded-l-[15px] overflow-hidden cursor-pointer" onClick={() => open(0)}>
          <img
            src={first}
            alt=""
            className="w-full h-full object-cover"
            onError={() => handleError(first)}
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-2.5">
          <div className={`min-h-0 overflow-hidden cursor-pointer ${hasThird ? 'flex-1 rounded-tr-[15px]' : 'h-full rounded-r-[15px]'}`} onClick={() => open(1)}>
            <img
              src={second}
              alt=""
              className="w-full h-full object-cover"
              onError={() => handleError(second)}
              loading="lazy"
            />
          </div>
          {hasThird && (
            <div className="flex-1 min-h-0 relative rounded-br-[15px] overflow-hidden cursor-pointer" onClick={() => open(2)}>
              <img
                src={third}
                alt=""
                className="w-full h-full object-cover"
                onError={() => handleError(third)}
                loading="lazy"
              />
              {remainingCount > 0 && (
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                  onClick={() => open(3)}
                >
                  <span className="text-white text-2xl font-normal">+{remainingCount}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {lightboxIndex !== null && <Lightbox urls={loadedUrls} startIndex={lightboxIndex} onClose={close} />}
    </>
  );
}
