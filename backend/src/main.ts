import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: '*', // Allow requests from any origin
        methods: '*', // Allow all HTTP methods
        allowedHeaders: '*', // Allow all headers
    });

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
