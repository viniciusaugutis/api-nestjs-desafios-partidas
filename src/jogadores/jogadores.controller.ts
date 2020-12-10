import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { JogadoresService } from './jogadores.service';
import { Jogador } from './interfaces/jogador.interface';
@Controller('api/v1/jogadores')
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}
  
  @Post()
  @UsePipes(ValidationPipe)
  async criarAtualizarJogador(@Body() criarJogadorDto: CriarJogadorDto) {
    await this.jogadoresService.criarAtualizarJogador(criarJogadorDto);
  }

  @Get()
  async consultarJogador(
    @Query('email') email: string,
  ): Promise<Jogador | Jogador[]> {
    if (email) {
      return this.jogadoresService.consultarJogadorPeloEmail(email);
    } else {
      return this.jogadoresService.consultarTodosJogadores();
    }
  }

  @Delete('/:email')
  async deletarJogador(@Param('email') email: string): Promise<void> {
    this.jogadoresService.deletarJogador(email);
  }
}
