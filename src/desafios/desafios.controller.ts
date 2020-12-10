import {
  Controller,
  UsePipes,
  ValidationPipe,
  Post,
  Body,
  Get,
  Query,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { Desafio } from './interfaces/desafio.interface';
import { DesafiosService } from './desafios.service';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
import { AtribuirDesafioPartidaDto } from './dtos/atribuir-desafio-partida.dto';

@Controller('api/v1/desafios')
export class DesafiosController {
  constructor(private readonly desafioService: DesafiosService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async criarDesafio(
    @Body() criarDesafioDto: CriarDesafioDto,
  ): Promise<Desafio> {
    return await this.desafioService.criarDesafio(criarDesafioDto);
  }

  @Get()
  async consultarDesafios(
    @Query('idJogador') idJogador: string,
  ): Promise<Desafio[]> {
    if (idJogador) {
      return await this.desafioService.consultarDesafiosDeUmJogador(idJogador);
    } else {
      return await this.desafioService.consultarTodosDesafios();
    }
  }

  @Put('/:id')
  async atualizarDesafio(
    @Param('id') id: string,
    @Body() atualizarDesafioDto: AtualizarDesafioDto,
  ): Promise<void> {
    await this.desafioService.atualizarDesafio(id, atualizarDesafioDto);
  }

  @Delete('/:id')
  async deletarDesafio(@Param('id') id: string): Promise<void> {
    await this.desafioService.deletarDesafio(id);
  }

  @Post('/:id/partida')
  async atribuirDesafioPartida(
    @Param('id') id: string,
    @Body() atribuirDesafioPartidaDto: AtribuirDesafioPartidaDto,
  ): Promise<void> {
    await this.desafioService.atualizarDesafioPartida(
      id,
      atribuirDesafioPartidaDto,
    );
  }
}
