import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors,
  Response,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as stream from 'stream';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('receive')
  @UseInterceptors(FileInterceptor('file'))
  async receiveFile(@Body() body: any) {
    console.log(body.stream);
    try {
      // Ensure the 'uploads' directory exists (create it if necessary)
      const uploadDirectory = 'uploads'; // Replace with your desired directory
      if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory);
      }

      // Create a writable stream to save the file
      const filePath = `${uploadDirectory}/test.txt`;
      const writableStream = fs.createWriteStream(filePath);
      // const dataBuffer = body.stream._readableState.buffer;
      const dataBuffer = Buffer.from(
        JSON.stringify(body.stream._readableState.buffer),
      );
      const readableStream = new stream.Readable();
      readableStream.push(dataBuffer);
      readableStream.push(null);
      readableStream.pipe(writableStream);
      // Listen for the 'finish' event, which indicates the file has been completely written
      writableStream.on('finish', () => {
        console.log(`File received and saved as: ${filePath}`);
      });

      return { message: 'File received and saved.' };
    } catch (error) {
      // Handle errors here, e.g., log the error for debugging
      console.error(`Error saving the file: ${error.message}`);
      throw new Error(`Error saving the file: ${error.message}`);
    }
  }
}
