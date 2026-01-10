import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_FILTER } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ProductsModule } from "./modules/products/products.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { UsersModule } from "./modules/users/users.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { ShippingModule } from "./modules/shipping/shipping.module";
import { UploadModule } from "./modules/upload/upload.module";
import { StaffModule } from "./modules/staff/staff.module";
import { PromotionsModule } from "./modules/promotions/promotions.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { WishlistModule } from "./modules/wishlist/wishlist.module";
import { EmailModule } from "./modules/email/email.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { HealthController } from "./modules/health/health.controller";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore as any,
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      ttl: 600, // Default 10 minutes cache
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== "production" ? { target: "pino-pretty" } : undefined,
        autoLogging: false,
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
          }),
        },
      },
    }),
    // Rate limiting: Configurable via env, defaults: 200 req/min
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || "60000"),
        limit: parseInt(process.env.THROTTLE_LIMIT || "200"),
      },
    ]),
    PrismaModule,
    EmailModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    UsersModule,
    PaymentsModule,
    ShippingModule,
    UploadModule,
    StaffModule,
    PromotionsModule,
    AnalyticsModule,
    ReviewsModule,
    WishlistModule,
    SettingsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
