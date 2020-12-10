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
  Put,
} from '@nestjs/common';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { JogadoresService } from './jogadores.service';
import { Jogador } from './interfaces/jogador.interface';
import { JogadoresValidacaoParametrosPipe } from './pipes/jogadores-validacao-parametros.pipe';
import { AtualizarJogadorDto } from './dtos/atualizar-jogador.dto';
@Controller('api/v1/jogadores')
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async criaJogador(
    @Body() criarJogadorDto: CriarJogadorDto,
  ): Promise<Jogador> {
    return await this.jogadoresService.criarJogador(criarJogadorDto);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  async atualizarJogador(
    @Body() atualizarJogadorDto: AtualizarJogadorDto,
    @Param('id', JogadoresValidacaoParametrosPipe) id: string,
  ): Promise<void> {
    await this.jogadoresService.atualizarJogador(id, atualizarJogadorDto);
  }

  @Get()
  async consultarTodosJogadores(): Promise<Jogador[]> {
    return this.jogadoresService.consultarTodosJogadores();
  }

  @Get('/:id')
  async consultarJogadorPeloId(@Param('id') id: string): Promise<Jogador> {
    return this.jogadoresService.consultarJogadorPeloId(id);
  }

  @Delete('/:id')
  async deletarJogador(
    @Param('id', JogadoresValidacaoParametrosPipe) id: string,
  ): Promise<void> {
    this.jogadoresService.deletarJogador(id);
  }
}
