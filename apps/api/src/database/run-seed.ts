import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { seed } from './seed';

async function runSeed() {
  console.log('🚀 Initializing seed runner...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    await seed(dataSource);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }

  console.log('👋 Seed runner finished.');
  process.exit(0);
}

void runSeed();
