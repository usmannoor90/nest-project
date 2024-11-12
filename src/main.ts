/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import Moralis from 'moralis';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
   const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description for your application')
    .setVersion('1.0')
    .addBearerAuth()  // Optional: add this line if you're using JWT authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await Moralis.start({
    apiKey: process.env.MOLARIS_API_KEY,
  });

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`started with the port of ${process.env.PORT}`);
  });
}

bootstrap();
