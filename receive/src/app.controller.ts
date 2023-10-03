import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('receive')
  async receiveFile(@Body() body: any) {
    try {
      const uploadDirectory = 'uploads';
      if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory);
      }
      const filePath = `${uploadDirectory}/${body.filename}`;
      const writableStream = fs.createWriteStream(filePath);
      const dataBufferHead: Buffer = Buffer.from(
        body.fss.stream._readableState.buffer.head.data.data,
      );

      fs.writeFile(filePath, dataBufferHead, (err) => {
        if (err) {
          console.log(err);
        }
      });

      writableStream.on('finish', () => {
        console.log(`File received and saved as: ${filePath}`);
      });

      return { message: 'File received and saved.' };
    } catch (error) {
      console.error(`Error saving the file: ${error.message}`);
      throw new Error(`Error saving the file: ${error.message}`);
    }
  }
}
