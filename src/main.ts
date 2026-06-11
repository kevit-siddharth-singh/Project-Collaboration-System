import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { API_VERSION } from './common/constants/api.version.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_VERSION.V1);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
