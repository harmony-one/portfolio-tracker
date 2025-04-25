import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from "@nestjs/config";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {AppService} from "./app.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appService = app.get(AppService);

  await appService.bootstrap();

  const config = new DocumentBuilder()
    .setTitle(configService.get('name'))
    .setDescription('PortfolioTracker API')
    .setVersion(configService.get('version'))
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get('port'));
}
bootstrap();
