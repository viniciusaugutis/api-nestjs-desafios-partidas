import {
  Controller,
  Post,
  Body,
  Inject,
  Injectable,
  Get,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { JogadoresService } from './jogadores.service';
import { Jogador } from './interfaces/jogador.interface';
@Controller('api/v1/jogadores')
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}

  @Get()
  async consultarJogador(
    @Query('email') email: string,
  ): Promise<Jogador | Jogador[]> {
    return this.jogadoresService.consultarTodosJogadores();
  }
}
