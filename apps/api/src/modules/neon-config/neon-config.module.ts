import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeonFont } from './entities/neon-font.entity';
import { NeonColor } from './entities/neon-color.entity';
import { NeonSize } from './entities/neon-size.entity';
import { NeonMaterial } from './entities/neon-material.entity';
import { NeonBackboard } from './entities/neon-backboard.entity';
import { CustomDesign } from './entities/custom-design.entity';
import { PreviewBackground } from './entities/preview-background.entity';
import { NeonConfigService } from './neon-config.service';
import { NeonConfigController } from './neon-config.controller';
import { CustomDesignsService } from './custom-designs.service';
import { CustomDesignsController } from './custom-designs.controller';
import { PreviewBackgroundsService } from './preview-backgrounds.service';
import { PreviewBackgroundsController } from './preview-backgrounds.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NeonFont,
      NeonColor,
      NeonSize,
      NeonMaterial,
      NeonBackboard,
      CustomDesign,
      PreviewBackground,
    ]),
  ],
  providers: [
    NeonConfigService,
    CustomDesignsService,
    PreviewBackgroundsService,
  ],
  controllers: [
    NeonConfigController,
    CustomDesignsController,
    PreviewBackgroundsController,
  ],
  exports: [NeonConfigService, CustomDesignsService, PreviewBackgroundsService],
})
export class NeonConfigModule {}
