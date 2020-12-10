import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CriarCategoriaDto } from './dtos/criar-categoria.dto';
import { AtualizarCategoriaDto } from './dtos/atualizar-categoria.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Categoria } from './interfaces/categoria.interface';
import { JogadoresService } from 'src/jogadores/jogadores.service';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectModel('Categoria') private readonly categoriaModel: Model<Categoria>,
    private readonly jogadorService: JogadoresService,
  ) {}

  async criarCategoria(
    criarCategoriaDto: CriarCategoriaDto,
  ): Promise<Categoria> {
    const { categoria } = criarCategoriaDto;

    const categoriaEncontrada = await this.categoriaModel
      .findOne({ categoria })
      .exec();

    if (categoriaEncontrada) {
      throw new BadRequestException('Categoria já cadastrada');
    }

    const categoriaCriada = new this.categoriaModel(criarCategoriaDto);
    return await categoriaCriada.save();
  }

  async consultarCategorias() {
    return await this.categoriaModel.find().populate('jogadores').exec();
  }

  async consultarCategoriaPorId(categoria: string): Promise<Categoria> {
    const categoriaEncontrada = await this.categoriaModel
      .findOne({ categoria })
      .exec();

    if (!categoriaEncontrada) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return categoriaEncontrada;
  }

  async deletarCategoriaPorId(categoria: string) {
    const categoriaEncontrada = await this.categoriaModel
      .findOne({ categoria })
      .exec();

    if (!categoriaEncontrada) {
      throw new NotFoundException('Categoria não encontrada');
    }

    this.categoriaModel.deleteOne(categoria).exec();
  }

  async atualizarCategoria(
    categoria: string,
    atualizarCategoriaDto: AtualizarCategoriaDto,
  ) {
    const categoriaEncontrada = await this.categoriaModel
      .findOne({ categoria })
      .exec();

    if (!categoriaEncontrada) {
      throw new NotFoundException('Categoria não encontrada');
    }

    this.categoriaModel
      .findOneAndUpdate({ categoria }, { $set: { atualizarCategoriaDto } })
      .exec();
  }

  async atribuirCategoriaJogador(params: string[]): Promise<void> {
    const categoria = params['categoria'];
    const idJogador = params['idJogador'];

    const categoriaEncontrada = await this.categoriaModel
      .findOne({ categoria })
      .exec();

    const jogadorJaCadastradoCategoria = await this.categoriaModel
      .find({
        categoria,
      })
      .where('jogadores')
      .in(idJogador);

    if (
      jogadorJaCadastradoCategoria &&
      jogadorJaCadastradoCategoria.length > 0
    ) {
      throw new BadRequestException('Jogador já cadastrado na categoria');
    }

    if (!categoriaEncontrada) {
      throw new BadRequestException('Jogador ou categoria não encontrados');
    }

    await this.jogadorService.consultarJogadorPeloId(idJogador);

    categoriaEncontrada.jogadores.push(idJogador);

    await this.categoriaModel
      .findOneAndUpdate({ categoria }, { $set: categoriaEncontrada })
      .exec();
  }
}
