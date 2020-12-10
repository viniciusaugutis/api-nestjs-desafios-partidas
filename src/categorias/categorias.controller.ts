import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Get,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CriarCategoriaDto } from './dtos/criar-categoria.dto';
import { Categoria } from './interfaces/categoria.interface';
import { CategoriasService } from './categorias.service';
import { AtualizarCategoriaDto } from './dtos/atualizar-categoria.dto';

@Controller('api/v1/categorias')
export class CategoriasController {
  constructor(private readonly categoriaService: CategoriasService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async criarCategoria(
    @Body() criarCategoriaDto: CriarCategoriaDto,
  ): Promise<Categoria> {
    return await this.categoriaService.criarCategoria(criarCategoriaDto);
  }

  @Get()
  async consultarCategorias(): Promise<Categoria[]> {
    return await this.categoriaService.consultarCategorias();
  }

  @Get('/:categoria')
  async consultarCategoriaPorId(
    @Param('categoria') categoria: string,
  ): Promise<Categoria> {
    return await this.categoriaService.consultarCategoriaPorId(categoria);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  async atualizarCategoria(
    @Param('categoria') categoria: string,
    @Body() atualizarCategoriaDto: AtualizarCategoriaDto,
  ): Promise<void> {
    await this.categoriaService.atualizarCategoria(
      categoria,
      atualizarCategoriaDto,
    );
  }

  @Delete('/:categoria')
  async deletarCategoriaPorId(
    @Param('categoria') categoria: string,
  ): Promise<void> {
    await this.categoriaService.deletarCategoriaPorId(categoria);
  }

  @Post('/:categoria/jogadores/:idJogador')
  async atribuirCategoriaJogador(@Param() params: string[]): Promise<void> {
    await this.categoriaService.atribuirCategoriaJogador(params);
  }
}
