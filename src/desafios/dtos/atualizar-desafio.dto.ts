import { IsDateString, IsOptional } from 'class-validator';
import { DesafioStatus } from '../enums/desafio-status.enum';

export class AtualizarDesafioDto {
  @IsOptional()
  @IsDateString()
  dataHoraDesafio: Date;

  @IsOptional()
  status: DesafioStatus;
}
