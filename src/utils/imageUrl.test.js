import { describe, it, expect } from 'vitest';
import { parseImageUrls } from './imageUrl.js';

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

  it('filters out non-Cloudinary URLs', () => {
    const cloudinary = 'https://res.cloudinary.com/demo/image/upload/a.jpg';
    const result = parseImageUrls(`${cloudinary},https://example.com/img.jpg`);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('cloudinary.com');
  });

  it('handles comma-separated Cloudinary URLs', () => {
    const a = 'https://res.cloudinary.com/demo/image/upload/a.jpg';
    const b = 'https://res.cloudinary.com/demo/image/upload/b.jpg';
    const result = parseImageUrls(`${a},${b}`);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('f_auto,q_auto,w_1200');
    expect(result[1]).toContain('f_auto,q_auto,w_1200');
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
