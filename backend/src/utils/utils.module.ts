import { Module } from '@nestjs/common';
import { FileToTextService } from './file-to-text.service';

@Module({
    providers: [FileToTextService],
    exports: [FileToTextService],
})
export class UtilsModule {}
