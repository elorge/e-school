// backend/src/modules/uploads/uploads.service.ts
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(fileBuffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
        (err, result) => {
          if (err || !result) {
            // Log the REAL Cloudinary error server-side — invalid API
            // key, wrong cloud name, and quota-exceeded all produce
            // different messages here, and swallowing them made this
            // undiagnosable from the frontend alone.
            this.logger.error(`Cloudinary upload failed: ${err?.message ?? 'no result returned'}`);
            return reject(new BadRequestException(err?.message ?? 'Image upload failed'));
          }
          resolve(result.secure_url);
        },
      );
      stream.end(fileBuffer);
    });
  }
}