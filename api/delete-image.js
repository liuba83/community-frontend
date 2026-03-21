import { deleteCloudinaryImageById } from './_lib/cloudinary.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publicId } = req.body || {};
  if (!publicId || typeof publicId !== 'string') {
    return res.status(400).json({ error: 'Missing publicId' });
  }

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    await deleteCloudinaryImageById(publicId);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: 'Failed to delete image' });
  }
}
