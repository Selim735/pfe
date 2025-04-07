import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req, res, next) => {
    const oldJson = res.json;
    res.json = function (data) {
      const replacer = (_key: string, value: any) =>
        typeof value === 'bigint' ? value.toString() : value;
      return oldJson.call(this, JSON.parse(JSON.stringify(data, replacer)));
    };
    next();
  });

  await app.listen(3000);
}
bootstrap();
