import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Desafio, Partida } from './interfaces/desafio.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { CategoriasService } from 'src/categorias/categorias.service';
import { DesafioStatus } from './enums/desafio-status.enum';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
import { AtribuirDesafioPartidaDto } from './dtos/atribuir-desafio-partida.dto';
import { PartidaSchema } from './interfaces/partida.schema';

@Injectable()
export class DesafiosService {
  constructor(
    @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
    @InjectModel('Partida') private readonly partidaModel: Model<Partida>,
    private readonly jogadorService: JogadoresService,
    private readonly categoriaService: CategoriasService,
  ) {}

  async criarDesafio(criarDesafioDto: CriarDesafioDto): Promise<Desafio> {
    /*
      Verificar se os jogadores informados estão cadastrados
    */

    const jogadores = await this.jogadorService.consultarTodosJogadores();

    criarDesafioDto.jogadores.map((jogadorDto) => {
      const jogadorFilter = jogadores.filter(
        (jogador) => jogador._id == jogadorDto._id,
      );

      if (jogadorFilter.length == 0) {
        throw new BadRequestException(
          `O id ${jogadorDto._id} não é um jogador!`,
        );
      }
    });

    /*
      Verificar se o solicitante é um dos jogadores da partida
    */

    const jogadorDesafio = criarDesafioDto.jogadores.find(
      (item) => item._id === criarDesafioDto.solicitante,
    );

    if (!jogadorDesafio) {
      throw new NotFoundException(
        'Solicitante não está presente nos jogadores do desafio',
      );
    }

    const categoriaDoJogador = await this.categoriaService.consultarCategoriaDoJogador(
      criarDesafioDto.solicitante,
    );

    const desafioModel = {
      ...criarDesafioDto,
      dataHoraSolicitacao: new Date(),
      status: DesafioStatus.PENDENTE,
      categoria: categoriaDoJogador.categoria,
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

  async atualizarDesafioPartida(
    id: string,
    atribuirDesafioPartidaDto: AtribuirDesafioPartidaDto,
  ): Promise<void> {
    const desafioCadastrado = await this.buscarDesafio(id);

    const jogadorDoDesafio = desafioCadastrado.jogadores.find(
      (jogador) => jogador._id == atribuirDesafioPartidaDto.def,
    );

    if (!jogadorDoDesafio) {
      throw new NotFoundException('Jogador vencedor não encontrado no desafio');
    }

    const partidaCriada = new this.partidaModel(atribuirDesafioPartidaDto);

    partidaCriada.categoria = desafioCadastrado.categoria;
    partidaCriada.jogadores = desafioCadastrado.jogadores;

    const resultado = await partidaCriada.save();

    desafioCadastrado.status = DesafioStatus.REALIZADO;
    desafioCadastrado.partida = resultado._id;

    try {
      await this.desafioModel.findByIdAndUpdate(desafioCadastrado.id, {
        $set: desafioCadastrado,
      });
    } catch (error) {
      /*
      Se a atualização do desafio falhar excluímos a partida 
      gravada anteriormente
      */
      await this.partidaModel.deleteOne({ _id: resultado._id }).exec();
      throw new InternalServerErrorException();
    }
  }
}
