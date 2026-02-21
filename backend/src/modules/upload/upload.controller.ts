import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadImage(file);
    return { url };
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadVideo(file);
    return { url };
  }

  @Post('profile-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePhoto(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadProfilePhoto(file);
    return { url };
  }

  @Post('cover-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCoverPhoto(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadCoverPhoto(file);
    return { url };
  }

  @Post('post-media')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPostMedia(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadPostMedia(file);
    return { url };
  }

  @Post('resource')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResource(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadResource(file);
    return { url };
  }

  @Delete(':publicId')
  async deleteMedia(@Param('publicId') publicId: string) {
    await this.uploadService.deleteMedia(publicId);
    return { message: 'Media deleted successfully' };
  }
}
