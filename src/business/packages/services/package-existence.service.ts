import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class UpdateStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async checkExistencePackages(hbls: string[]) {
    /*
    rimero debe crear una variale capaz de almacenar la lista de hbls
    debe consultar la existencia en la base de datos de cada hbl en caso de no existir
    debe agregar este hbl a la lista de hbls que no existen
    al terminar debe retornar un arreglo vacio si ningun hbl fue agregado a la lista o lo 
    que es lo mismo si todos las hbl tuvieron coincidencai en la base de datos
    de lo contrario devolver el arreglo con todos los hbls que no existen en la base de datos
    */
  }
}
