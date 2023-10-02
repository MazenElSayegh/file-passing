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
import * as http from 'http';
import { createReadStream } from 'fs';
import { join } from 'path';
import { HttpService } from '@nestjs/axios';

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
    const url = 'http://localhost:3002/receive'; // Replace with the URL of the other API

    try {
      const response = await this.httpService.post(url, fss).toPromise();
      return response.data;
    } catch (error) {
      // Handle errors here
      throw new Error(
        `Error sending POST request to the API: ${error.message}`,
      );
    }
  }
  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   const fileStream = new Readable();
  //   // const files = createReadStream(join(process.cwd(), 'package.json'));
  //   fileStream.push(file.buffer);
  //   fileStream.push(null);
  //   const options = {
  //     hostname: 'localhost',
  //     port: 3002,
  //     path: '/receive',
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/octet-stream', // Specify the content type as octet-stream
  //     },
  //   };
  //   const request: any = http.request(options, (response) => {
  //     // Handle the response from API 2
  //     let responseData = '';

  //     response.on('data', (chunk) => {
  //       responseData += chunk;
  //     });

  //     response.on('end', () => {
  //       console.log(responseData);
  //     });
  //   });

  //   // Handle any request errors
  //   request.on('error', (error) => {
  //     console.error(error);
  //   });
  //   // console.log(request);

  //   // Pipe the file stream into the request
  //   const fss = new StreamableFile(fileStream);
  //   request.body = fss;
  //   fileStream.pipe(request);
  //   // console.log(request);

  //   // console.log('after');

  //   return 'request';
  // }
}
