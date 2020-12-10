import { Jogador } from 'src/jogadores/interfaces/jogador.interface';
import {
  IsNotEmpty,
  IsDateString,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class CriarDesafioDto {
  @IsNotEmpty()
  @IsDateString()
  dataHoraDesafio: Date;

  @IsNotEmpty()
  solicitante: Jogador;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  jogadores: Array<Jogador>;
}
