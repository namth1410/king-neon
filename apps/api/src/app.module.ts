import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Modules
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { NeonConfigModule } from './modules/neon-config/neon-config.module';
import { OrdersModule } from './modules/orders/orders.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { UploadModule } from './modules/upload/upload.module';
import { CartModule } from './modules/cart/cart.module';

@Module({
  imports: [
    // Config Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM Module
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5434),
        username: configService.get('DATABASE_USER', 'king_neon'),
        password: configService.get('DATABASE_PASSWORD', 'king_neon_secret'),
        database: configService.get('DATABASE_NAME', 'king_neon_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Set to false in production
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    NeonConfigModule,
    OrdersModule,
    QuotesModule,
    UploadModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
