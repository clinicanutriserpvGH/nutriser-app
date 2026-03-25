import { describe, it, expect } from 'vitest';

describe('Cloudinary credentials', () => {
  it('should connect to Cloudinary successfully', async () => {
    const { v2: cloudinary } = await import('cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dikinwkjq',
      api_key: process.env.CLOUDINARY_API_KEY || '848345883923821',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'f0BRNKuqmYrVWwF2DXzW1H1lNEA',
    });
    const result = await cloudinary.api.ping();
    expect(result.status).toBe('ok');
  });
});
