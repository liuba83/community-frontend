import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  process.env.CLOUDINARY_CLOUD_NAME = 'testcloud';
  process.env.CLOUDINARY_API_KEY = 'key';
  process.env.CLOUDINARY_API_SECRET = 'secret';
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;
});

import { deleteCloudinaryImages, deleteCloudinaryImageById } from './cloudinary.js';

describe('deleteCloudinaryImages', () => {
  it('is a no-op when imagesCsv is null', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await deleteCloudinaryImages(null);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('is a no-op when imagesCsv is empty string', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await deleteCloudinaryImages('');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls Cloudinary delete for each valid URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await deleteCloudinaryImages(
      'https://res.cloudinary.com/testcloud/image/upload/v1/folder/img1.jpg,' +
      'https://res.cloudinary.com/testcloud/image/upload/folder/img2.png'
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toContain('folder%2Fimg1');
    expect(fetchMock.mock.calls[1][0]).toContain('folder%2Fimg2');
  });

  it('skips non-Cloudinary URLs', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await deleteCloudinaryImages(
      'https://res.cloudinary.com/testcloud/image/upload/v1/img.jpg,' +
      'https://evil.com/img.jpg'
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('continues deleting remaining images when one fails', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await deleteCloudinaryImages(
      'https://res.cloudinary.com/testcloud/image/upload/v1/img1.jpg,' +
      'https://res.cloudinary.com/testcloud/image/upload/v1/img2.jpg'
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('deleteCloudinaryImageById', () => {
  it('calls the Cloudinary Resources API with correct publicId and auth', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' });
    vi.stubGlobal('fetch', fetchMock);

    await deleteCloudinaryImageById('folder/my-image');

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain('testcloud');
    expect(url).toContain(encodeURIComponent('folder/my-image'));
    expect(opts.method).toBe('DELETE');
    expect(opts.headers.Authorization).toMatch(/^Basic /);
  });

  it('throws when Cloudinary returns non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, text: async () => 'Not Found' }));
    await expect(deleteCloudinaryImageById('missing/img')).rejects.toThrow();
  });

  it('throws immediately when Cloudinary credentials are missing', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(deleteCloudinaryImageById('some/img')).rejects.toThrow('Cloudinary credentials not configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
