import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import * as fc from 'fast-check';
import { UploadService } from './upload.service';
import { v2 as cloudinary } from 'cloudinary';

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

// Mock streamifier
jest.mock('streamifier', () => ({
  createReadStream: jest.fn(() => ({
    pipe: jest.fn(),
  })),
}));

describe('UploadService Property Tests', () => {
  let service: UploadService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                CLOUDINARY_CLOUD_NAME: 'test-cloud',
                CLOUDINARY_API_KEY: 'test-key',
                CLOUDINARY_API_SECRET: 'test-secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Feature: instagram-profile-system, Property 28: Media Upload Round Trip
  describe('Property 28: Media Upload Round Trip', () => {
    it('should return a Cloudinary URL for any valid image file', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid image files
          fc.record({
            buffer: fc.uint8Array({ minLength: 100, maxLength: 1000 }),
            mimetype: fc.constantFrom(
              'image/jpeg',
              'image/jpg',
              'image/png',
              'image/gif',
              'image/webp',
            ),
            size: fc.integer({ min: 1, max: 10 * 1024 * 1024 }), // Up to 10MB
            originalname: fc.string({ minLength: 5, maxLength: 50 }).map(s => `${s}.jpg`),
          }),
          async (fileData) => {
            const file = {
              buffer: Buffer.from(fileData.buffer),
              mimetype: fileData.mimetype,
              size: fileData.size,
              originalname: fileData.originalname,
            } as Express.Multer.File;

            // Mock successful Cloudinary upload
            const mockUrl = `https://res.cloudinary.com/test-cloud/image/upload/v1234567890/${fileData.originalname}`;
            (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
              (options, callback) => {
                callback(null, { secure_url: mockUrl });
                return { pipe: jest.fn() };
              },
            );

            // Upload the file
            const result = await service.uploadImage(file);

            // Verify: The result should be a valid Cloudinary URL
            expect(result).toBe(mockUrl);
            expect(result).toMatch(/^https:\/\/res\.cloudinary\.com\//);
            expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
              expect.objectContaining({
                resource_type: 'image',
                folder: 'ctn-social',
              }),
              expect.any(Function),
            );
          },
        ),
        { numRuns: 5 }, // Fast property test with 5 iterations
      );
    });

    it('should return a Cloudinary URL for any valid video file', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid video files
          fc.record({
            buffer: fc.uint8Array({ minLength: 1000, maxLength: 5000 }),
            mimetype: fc.constantFrom('video/mp4', 'video/quicktime'),
            size: fc.integer({ min: 1, max: 100 * 1024 * 1024 }), // Up to 100MB
            originalname: fc.string({ minLength: 5, maxLength: 50 }).map(s => `${s}.mp4`),
          }),
          async (fileData) => {
            const file = {
              buffer: Buffer.from(fileData.buffer),
              mimetype: fileData.mimetype,
              size: fileData.size,
              originalname: fileData.originalname,
            } as Express.Multer.File;

            // Mock successful Cloudinary upload
            const mockUrl = `https://res.cloudinary.com/test-cloud/video/upload/v1234567890/${fileData.originalname}`;
            (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
              (options, callback) => {
                callback(null, { secure_url: mockUrl });
                return { pipe: jest.fn() };
              },
            );

            // Upload the file
            const result = await service.uploadVideo(file);

            // Verify: The result should be a valid Cloudinary URL
            expect(result).toBe(mockUrl);
            expect(result).toMatch(/^https:\/\/res\.cloudinary\.com\//);
            expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
              expect.objectContaining({
                resource_type: 'video',
                folder: 'ctn-social',
              }),
              expect.any(Function),
            );
          },
        ),
        { numRuns: 5 }, // Fast property test with 5 iterations
      );
    });
  });

  // Feature: instagram-profile-system, Property 29: File Type Validation
  describe('Property 29: File Type Validation', () => {
    it('should reject any file with invalid image type', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            buffer: fc.uint8Array({ minLength: 100, maxLength: 1000 }),
            mimetype: fc.constantFrom(
              'application/pdf',
              'text/plain',
              'application/zip',
              'video/mp4', // Video type for image upload
              'audio/mpeg',
            ),
            size: fc.integer({ min: 1, max: 10 * 1024 * 1024 }),
            originalname: fc.string({ minLength: 5, maxLength: 50 }),
          }),
          async (fileData) => {
            const file = {
              buffer: Buffer.from(fileData.buffer),
              mimetype: fileData.mimetype,
              size: fileData.size,
              originalname: fileData.originalname,
            } as Express.Multer.File;

            // Verify: Upload should throw BadRequestException
            await expect(service.uploadImage(file)).rejects.toThrow(
              BadRequestException,
            );
            await expect(service.uploadImage(file)).rejects.toThrow(
              /Invalid file type/,
            );
          },
        ),
        { numRuns: 5 },
      );
    });

    it('should reject any file with invalid video type', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            buffer: fc.uint8Array({ minLength: 100, maxLength: 1000 }),
            mimetype: fc.constantFrom(
              'application/pdf',
              'text/plain',
              'image/jpeg', // Image type for video upload
              'audio/mpeg',
              'video/avi', // Unsupported video format
            ),
            size: fc.integer({ min: 1, max: 100 * 1024 * 1024 }),
            originalname: fc.string({ minLength: 5, maxLength: 50 }),
          }),
          async (fileData) => {
            const file = {
              buffer: Buffer.from(fileData.buffer),
              mimetype: fileData.mimetype,
              size: fileData.size,
              originalname: fileData.originalname,
            } as Express.Multer.File;

            // Verify: Upload should throw BadRequestException
            await expect(service.uploadVideo(file)).rejects.toThrow(
              BadRequestException,
            );
            await expect(service.uploadVideo(file)).rejects.toThrow(
              /Invalid file type/,
            );
          },
        ),
        { numRuns: 5 },
      );
    });
  });

  // Feature: instagram-profile-system, Property 30: File Size Validation
  describe('Property 30: File Size Validation', () => {
    it('should reject any image file exceeding 10MB', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            buffer: fc.uint8Array({ minLength: 100, maxLength: 1000 }),
            mimetype: fc.constantFrom('image/jpeg', 'image/png'),
            size: fc.integer({ min: 10 * 1024 * 1024 + 1, max: 50 * 1024 * 1024 }), // Over 10MB
            originalname: fc.string({ minLength: 5, maxLength: 50 }).map(s => `${s}.jpg`),
          }),
          async (fileData) => {
            const file = {
              buffer: Buffer.from(fileData.buffer),
              mimetype: fileData.mimetype,
              size: fileData.size,
              originalname: fileData.originalname,
            } as Express.Multer.File;

            // Verify: Upload should throw BadRequestException
            await expect(service.uploadImage(file)).rejects.toThrow(
              BadRequestException,
            );
            await expect(service.uploadImage(file)).rejects.toThrow(
              /File size exceeds maximum limit/,
            );
          },
        ),
        { numRuns: 5 },
      );
    });

    it('should reject any video file exceeding 100MB', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            buffer: fc.uint8Array({ minLength: 100, maxLength: 1000 }),
            mimetype: fc.constantFrom('video/mp4', 'video/quicktime'),
            size: fc.integer({ min: 100 * 1024 * 1024 + 1, max: 200 * 1024 * 1024 }), // Over 100MB
            originalname: fc.string({ minLength: 5, maxLength: 50 }).map(s => `${s}.mp4`),
          }),
          async (fileData) => {
            const file = {
              buffer: Buffer.from(fileData.buffer),
              mimetype: fileData.mimetype,
              size: fileData.size,
              originalname: fileData.originalname,
            } as Express.Multer.File;

            // Verify: Upload should throw BadRequestException
            await expect(service.uploadVideo(file)).rejects.toThrow(
              BadRequestException,
            );
            await expect(service.uploadVideo(file)).rejects.toThrow(
              /File size exceeds maximum limit/,
            );
          },
        ),
        { numRuns: 5 },
      );
    });
  });
});
