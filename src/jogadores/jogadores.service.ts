import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { Jogador } from './interfaces/jogador.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AtualizarJogadorDto } from './dtos/atualizar-jogador.dto';

@Injectable()
export class JogadoresService {
  constructor(
    @InjectModel('Jogador') private readonly jogadorModel: Model<Jogador>,
  ) {}

  private readonly logger = new Logger(JogadoresService.name);

  async criarJogador(criarJogadorDto: CriarJogadorDto): Promise<Jogador> {
    const { email } = criarJogadorDto;

    const jogadorEncontrado = await this.jogadorModel.findOne({ email }).exec();

    if (jogadorEncontrado) {
      throw new BadRequestException(`Jogador com email ${email} já cadastrado`);
    }

    const jogadorCriado = new this.jogadorModel(criarJogadorDto);
    return await jogadorCriado.save();
  }

  async atualizarJogador(
    id: string,
    atualizarJogadorDto: AtualizarJogadorDto,
  ): Promise<Jogador> {
    const jogadorEncontrado = await this.jogadorModel
      .findOne({ _id: id })
      .exec();

    if (!jogadorEncontrado) {
      throw new NotFoundException(`Jogador não encontrado`);
    }

    return await this.jogadorModel
      .findOneAndUpdate({ _id: id }, { $set: atualizarJogadorDto })
      .exec();
  }

  async consultarTodosJogadores(): Promise<Jogador[]> {
    return await this.jogadorModel.find().exec();
  }

  async consultarJogadorPeloId(id: string): Promise<Jogador> {
    const jogadorEncontrado = await this.jogadorModel
      .findOne({ _id: id })
      .exec();
    if (!jogadorEncontrado) {
      throw new NotFoundException(`Jogador não encontrado`);
    }
    return jogadorEncontrado;
  }

  async deletarJogador(id: string): Promise<any> {
    const jogadorEncontrado = await this.jogadorModel
      .findOne({ _id: id })
      .exec();
    if (!jogadorEncontrado) {
      throw new NotFoundException(`Jogador não encontrado`);
    }
    return await this.jogadorModel.deleteOne({ _id: id }).exec();
  }
}
