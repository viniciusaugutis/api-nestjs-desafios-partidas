import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Desafio } from './interfaces/desafio.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { CategoriasService } from 'src/categorias/categorias.service';
import { DesafioStatus } from './enums/desafio-status.enum';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';

@Injectable()
export class DesafiosService {
  constructor(
    @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
    private readonly jogadorService: JogadoresService,
    private readonly categoriaService: CategoriasService,
  ) {}

  async criarDesafio(criarDesafioDto: CriarDesafioDto): Promise<Desafio> {
    /*
      Verificar se os jogadores informados estão cadastrados
    */

    criarDesafioDto.jogadores.map((jogador) => {
      const jogadorEncontrado = this.jogadorService.consultarJogadorPeloId(
        jogador.id,
      );
      if (!jogadorEncontrado) {
        throw new NotFoundException('Jogador não encontrado');
      }
    });

    /*
      Verificar se o solicitante é um dos jogadores da partida
    */

    const jogadorDesafio = criarDesafioDto.jogadores.find(
      (item) => item.id === criarDesafioDto.solicitante.id,
    );

    if (!jogadorDesafio) {
      throw new NotFoundException(
        'Solicitante não está presente nos jogadores do desafio',
      );
    }

    const todasCategorias = await this.categoriaService.consultarCategorias();

    const categoriasSolicitante = todasCategorias.filter((categoria) => {
      return categoria.jogadores.find(
        (jogador) => jogador.id === criarDesafioDto.solicitante.id,
      );
    });

    if (
      !categoriasSolicitante &&
      categoriasSolicitante &&
      !categoriasSolicitante[0]
    ) {
      throw new BadRequestException(
        'Jogador não está vinculado em uma categoria',
      );
    }

    const desafioModel = {
      ...criarDesafioDto,
      dataHoraSolicitacao: new Date(),
      status: DesafioStatus.PENDENTE,
      categoria: categoriasSolicitante[0].categoria,
    };

    const desafioCriado = new this.desafioModel(desafioModel);
    return await desafioCriado.save();
  }

  async consultarDesafiosDeUmJogador(idJogador: any): Promise<Desafio[]> {
    const jogadorEncontrado = await this.jogadorService.consultarJogadorPeloId(
      idJogador,
    );

    if (!jogadorEncontrado) {
      throw new BadRequestException(`O id não é um jogador!`);
    }

    return await this.desafioModel
      .find()
      .where('jogadores')
      .in(idJogador)
      .populate('solicitante')
      .populate('jogadores')
      .populate('partida')
      .exec();
  }

  async consultarTodosDesafios(): Promise<Desafio[]> {
    return await this.desafioModel
      .find()
      .populate('jogadores')
      .populate('solicitante')
      .populate('partida')
      .exec();
  }

  async atualizarDesafio(
    id: string,
    atualizarDesafioDto: AtualizarDesafioDto,
  ): Promise<void> {
    const desafioEncontrado = await this.buscarDesafio(id);

    if (atualizarDesafioDto.status) {
      desafioEncontrado.dataHoraResposta = new Date();
    }

    desafioEncontrado.status = atualizarDesafioDto.status;
    desafioEncontrado.dataHoraDesafio = atualizarDesafioDto.dataHoraDesafio;

    this.desafioModel
      .findOneAndUpdate({ _id: id }, { $set: atualizarDesafioDto })
      .exec();
  }

  async buscarDesafio(id: string): Promise<Desafio> {
    const desafioEncontrado = await this.desafioModel.findById(id).exec();
    if (!desafioEncontrado) {
      throw new NotFoundException(`Desafio não cadastrado!`);
    }
    return desafioEncontrado;
  }

  async deletarDesafio(id: string): Promise<void> {
    const desafioEncontrado = await this.buscarDesafio(id);

    desafioEncontrado.status = DesafioStatus.CANCELADO;

    await this.desafioModel
      .findByIdAndUpdate(id, { $set: desafioEncontrado })
      .exec();
  }
}
