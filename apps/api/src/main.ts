import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Security Headers
  app.use(helmet());

  // Enable CORS
  app.enableCors({
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global prefix for API routes
  app.setGlobalPrefix("api");

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle("JFS Wears API")
    .setDescription("E-commerce backend API for JFS Wears")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  console.log(`🚀 JFS Wears API running on http://localhost:${process.env.PORT || 3001}`);
  console.log(`📄 Swagger Docs available at http://localhost:${process.env.PORT || 3001}/api/docs`);

  const port = process.env.PORT || 3001;
  await app.listen(port);
}

bootstrap();
