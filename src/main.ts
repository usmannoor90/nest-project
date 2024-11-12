/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import Moralis from 'moralis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   await Moralis.start({
            apiKey: process.env.MOLARIS_API_KEY,
        })

  await app.listen(process.env.PORT ?? 3000,()=>{
    console.log(`started with the port of ${process.env.PORT}`);
  });
}
bootstrap();
