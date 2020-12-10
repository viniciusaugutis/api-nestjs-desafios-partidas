import { Module } from '@nestjs/common';
import { DesafiosController } from './desafios.controller';
import { DesafiosService } from './desafios.service';
import { DesafioSchema } from './interfaces/desafio.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JogadoresModule } from 'src/jogadores/jogadores.module';
import { CategoriasModule } from 'src/categorias/categorias.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Desafio', schema: DesafioSchema }]),
    JogadoresModule,
    CategoriasModule,
  ],
  controllers: [DesafiosController],
  providers: [DesafiosService],
})
export class DesafiosModule {}
