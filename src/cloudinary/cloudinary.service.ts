import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File, timeoutMs = 120000): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Upload timeout after ${timeoutMs} ms`));
      }, timeoutMs);

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'pizzas' },
        (error, result) => {
          clearTimeout(timer);
          if (error) return reject(error);
          if (!result) return reject(new Error('No result from Cloudinary'));
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }
}
