import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private httpService: HttpService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileStream = new Readable();
    fileStream.push(file.buffer);
    fileStream.push(null);
    const fss = new StreamableFile(fileStream);
    const url = 'http://localhost:3002/receive';
    const filename = file.originalname;
    try {
      const response = await lastValueFrom(
        this.httpService.post(url, { fss, filename }),
      );
      return response.data;
    } catch (error) {
      // Handle errors here
      throw new Error(
        `Error sending POST request to the API: ${error.message}`,
      );
    }
  }
}
