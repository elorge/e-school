// backend/src/modules/schools/dto/set-locale.dto.ts
import { IsIn } from 'class-validator';
import { SUPPORTED_LOCALES } from '../../../common/utils/locale.util';

export class SetLocaleDto {
  @IsIn(SUPPORTED_LOCALES, { message: `locale must be one of: ${SUPPORTED_LOCALES.join(', ')}` })
  locale!: string;
}
