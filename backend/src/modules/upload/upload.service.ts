import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];

  private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

  async uploadImage(file: Express.Multer.File): Promise<string> {
    // Validate file type
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > this.MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${this.MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
      );
    }

    return this.uploadToCloudinary(file, 'image', 'ctn-social/general');
  }

  async uploadVideo(file: Express.Multer.File): Promise<string> {
    // Validate file type
    if (!this.ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_VIDEO_TYPES.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > this.MAX_VIDEO_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${this.MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
      );
    }

    return this.uploadToCloudinary(file, 'video', 'ctn-social/general');
  }

  async uploadProfilePhoto(file: Express.Multer.File): Promise<string> {
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`,
      );
    }

    if (file.size > this.MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${this.MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
      );
    }

    return this.uploadToCloudinary(file, 'image', 'ctn-social/profiles');
  }

  async uploadCoverPhoto(file: Express.Multer.File): Promise<string> {
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`,
      );
    }

    if (file.size > this.MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${this.MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
      );
    }

    return this.uploadToCloudinary(file, 'image', 'ctn-social/covers');
  }

  async uploadPostMedia(file: Express.Multer.File): Promise<string> {
    const isImage = this.ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const isVideo = this.ALLOWED_VIDEO_TYPES.includes(file.mimetype);

    if (!isImage && !isVideo) {
      throw new BadRequestException(
        'Invalid file type. Must be an image or video.',
      );
    }

    if (isImage) {
      if (file.size > this.MAX_IMAGE_SIZE) {
        throw new BadRequestException(
          `Image size exceeds maximum limit of ${this.MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
        );
      }
      return this.uploadToCloudinary(file, 'image', 'ctn-social/posts');
    } else {
      if (file.size > this.MAX_VIDEO_SIZE) {
        throw new BadRequestException(
          `Video size exceeds maximum limit of ${this.MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
        );
      }
      return this.uploadToCloudinary(file, 'video', 'ctn-social/posts');
    }
  }

  async uploadResource(file: Express.Multer.File): Promise<string> {
    // Allow documents for resources
    const allowedTypes = [
      ...this.ALLOWED_IMAGE_TYPES,
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type for resource upload.',
      );
    }

    const maxSize = 50 * 1024 * 1024; // 50MB for documents
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`,
      );
    }

    return this.uploadToCloudinary(file, 'raw', 'ctn-social/resources');
  }

  private uploadToCloudinary(
    file: Express.Multer.File,
    resourceType: 'image' | 'video' | 'raw',
    folder: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: folder,
        },
        (error, result) => {
          if (error) {
            reject(new BadRequestException('Upload failed: ' + error.message));
          } else {
            resolve(result.secure_url);
          }
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteMedia(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new BadRequestException('Failed to delete media: ' + error.message);
    }
  }
}
