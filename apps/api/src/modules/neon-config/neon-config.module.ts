import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeonFont } from './entities/neon-font.entity';
import { NeonColor } from './entities/neon-color.entity';
import { NeonSize } from './entities/neon-size.entity';
import { NeonMaterial } from './entities/neon-material.entity';
import { NeonBackboard } from './entities/neon-backboard.entity';
import { CustomDesign } from './entities/custom-design.entity';
import { NeonConfigService } from './neon-config.service';
import { NeonConfigController } from './neon-config.controller';
import { CustomDesignsService } from './custom-designs.service';
import { CustomDesignsController } from './custom-designs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NeonFont,
      NeonColor,
      NeonSize,
      NeonMaterial,
      NeonBackboard,
      CustomDesign,
    ]),
  ],
  providers: [NeonConfigService, CustomDesignsService],
  controllers: [NeonConfigController, CustomDesignsController],
  exports: [NeonConfigService, CustomDesignsService],
})
export class NeonConfigModule {}
