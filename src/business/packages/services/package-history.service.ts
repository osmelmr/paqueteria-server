import { Injectable } from '@nestjs/common';

@Injectable()
class PackageHistoryService {
  history() {
    /*
    este servicio debe recibir unicamente el id de un paquete y a travez de este 
    debemos buscar en la db todos los estados y locaciones asociados a ese paquete osea 
    obtener las tuplas de package status history asociadas a el paquete y devolver 
    una lista de estas que contenga el estado la localizacion y la fecha 
    */
    return 0;
  }
}
