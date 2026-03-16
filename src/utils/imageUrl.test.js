import { describe, it, expect } from 'vitest';
import { convertGoogleDriveUrl, parseImageUrls } from './imageUrl.js';

describe('convertGoogleDriveUrl', () => {
  it('converts the /file/d/ pattern', () => {
    expect(convertGoogleDriveUrl('https://drive.google.com/file/d/FILEID123/view'))
      .toBe('https://drive.google.com/thumbnail?id=FILEID123&sz=w1000');
  });

  it('converts the ?id= query param pattern', () => {
    expect(convertGoogleDriveUrl('https://drive.google.com/open?id=FILEID456'))
      .toBe('https://drive.google.com/thumbnail?id=FILEID456&sz=w1000');
  });

  it('returns the original URL when no pattern matches', () => {
    expect(convertGoogleDriveUrl('https://example.com/image.jpg'))
      .toBe('https://example.com/image.jpg');
  });

  it('returns null for null or empty input', () => {
    expect(convertGoogleDriveUrl(null)).toBe(null);
    expect(convertGoogleDriveUrl('')).toBe(null);
  });
});

describe('parseImageUrls', () => {
  it('returns an empty array for falsy input', () => {
    expect(parseImageUrls(null)).toEqual([]);
    expect(parseImageUrls('')).toEqual([]);
  });

  it('applies Cloudinary optimization transform', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    expect(parseImageUrls(url)).toEqual([
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1200/sample.jpg',
    ]);
  });

  it('converts Google Drive URLs', () => {
    const url = 'https://drive.google.com/file/d/FILEID/view';
    expect(parseImageUrls(url)).toEqual([
      'https://drive.google.com/thumbnail?id=FILEID&sz=w1000',
    ]);
  });

  it('handles comma-separated mixed URLs', () => {
    const cloudinary = 'https://res.cloudinary.com/demo/image/upload/a.jpg';
    const drive = 'https://drive.google.com/file/d/XYZ/view';
    const result = parseImageUrls(`${cloudinary},${drive}`);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('f_auto,q_auto,w_1200');
    expect(result[1]).toBe('https://drive.google.com/thumbnail?id=XYZ&sz=w1000');
  });

  it('trims whitespace around URLs', () => {
    const url = '  https://res.cloudinary.com/demo/image/upload/a.jpg  ';
    expect(parseImageUrls(url)).toHaveLength(1);
  });

  it('filters out empty entries from trailing commas', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/a.jpg,';
    expect(parseImageUrls(url)).toHaveLength(1);
  });
});
