import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { BusinessEntity } from '../dto/business-entity.dto.js';
import { BulkAiEntities } from '../dto/business-ia-entity.dto.js';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async processBulkAiEntities(entities: BulkAiEntities) {
    const businesEntities = await this.resolverBulkAiEntitiesUtility(entities);
    /*a partir de esto ahora el debe crear una variable seccess y una variable failed
    entonces procedera a recorrer cada elemento del arreglo de businessEntity que obtiene de 
    resolverBulkAiEntitiesUtility almacenando cada uno en la base de datos
     de esta forma si alguno da error en cualquier parte de este proceso
      no devolverremos el error si no que 
    guardaremos el elemento y el error
    y si es de exito guardamos el elemento
    finalmente devolvemos ambos conjuntos de datos en una respuesta y asi el frontend sabra que hacer
     */
    const success: any[] = [];
    const failed: Array<{ entity: BusinessEntity; error: string }> = [];

    for (const entity of businesEntities) {
      try {
        const packageData = await this.resolverEntityUtility(entity);
        if (!packageData.statusId || !packageData.locationId) {
          throw new Error(
            'La entidad debe tener un status y una ubicacion validos',
          );
        }
        const pkg = await this.prisma.$transaction(async (tx) => {
          const created = await tx.package.create({ data: packageData as any });
          await tx.packageStatusHistory.create({
            data: {
              packageId: created.id,
              statusId: packageData.statusId,
              locationId: packageData.locationId,
            },
          });
          if (entity.hblCodes?.length > 0) {
            await tx.packageHbl.createMany({
              data: entity.hblCodes.map((hbl) => ({
                packageId: created.id,
                hblCode: hbl,
              })),
            });
          }
          return created;
        });
        success.push(pkg);
      } catch (error) {
        failed.push({ entity, error: (error as Error).message });
      }
    }

    return { success, failed };
  }
  async resolverEntityUtility(entity: BusinessEntity) {
    // Aquí puedes implementar la lógica para procesar una sola entidad de negocio
    /* logica de implementacion:
    0 creamo una variable que almacenaran los datos de un 
    paquete que se almacenara en la db al culminar el proceso
    (este paquete sera del tipo de prisma para poder guardar un paquete en la base de datos)
    1
        verifiamos si la id de la guia es valida
        verificamos si la is del estatus es valida
        verificamos si la id de la ubicacion es valida
        si son validos los agregamos al paquete final
    2 
    verificamos si de la Provincia/municipio trae el id y/o el valor
    si alguna trae el id lo verificamos
    si es valido lo agregamos al paquete final y no rrevisamos el valor
    si no trae id o no es valido comprobamos si hay valor y creamos el elemento en la base de datos
    tomamos la id devuelta y la agregamos al paquete final
    3 verificamos si trae idCard si la trae buscamos una coincidencia de la misma en la db
    la busqueda sera: una id card es un grupo de numeros no obstante puede traer 0 delante y este es valido
    por lo tanto se debe tratar como un string una id card cubana que es la que usamos tiene 11 dijitos
    en caso de tener 10 es un error anterior a nosotros y es porque tenia un 0 delante si tiene menos de 10 
    tambien es un error
    en cualquier caso la busqueda debe realizarce como contiene por esta misma razon si el dato entrante tiene
    menos de 8 dijitos damos coincidencia como falza y continuamos
    en caso de coincidir el id card con alguno en la db se toam la id del recipent y se almacena en el paquete final
    en caso de no existir coincidencia ninguna
    procedemos a crear un recipeient o destinatario en la db con los datos de:
    el array de los numeros telefonicos el fullName y el idCard 
    una vez construido tomamos el id y lo agregamos al paquete final
    4
    posteriormente agregamos los datos que falten de la entrada original y devolvemos el paquete listo para que otro servicio lo guarde
    mas adelante implementaremos la logica de validacion en un utils
     */
    const packageData: Record<string, any> = {};

    if (entity.guideId) {
      const guide = await this.prisma.guide.findUnique({
        where: { id: entity.guideId },
      });
      if (guide) packageData.guideId = entity.guideId;
    }

    if (entity.statusId) {
      const status = await this.prisma.status.findUnique({
        where: { id: entity.statusId },
      });
      if (status) packageData.statusId = entity.statusId;
    }

    if (entity.locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: entity.locationId },
      });
      if (location) packageData.locationId = entity.locationId;
    }

    if (entity.provinceId) {
      const province = await this.prisma.province.findUnique({
        where: { id: entity.provinceId },
      });
      if (province) packageData.provinceId = entity.provinceId;
    } else if (entity.province) {
      const existing = await this.prisma.province.findFirst({
        where: { name: { contains: entity.province, mode: 'insensitive' } },
      });
      if (existing) {
        packageData.provinceId = existing.id;
      } else {
        const normalized = entity.province
          .toUpperCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        const created = await this.prisma.province.create({
          data: { name: normalized },
        });
        packageData.provinceId = created.id;
      }
    }

    if (entity.municipeId) {
      const municipe = await this.prisma.municipe.findUnique({
        where: { id: entity.municipeId },
      });
      if (municipe) packageData.municipeId = entity.municipeId;
    } else if (entity.municipe) {
      const existing = await this.prisma.municipe.findFirst({
        where: { name: { contains: entity.municipe, mode: 'insensitive' } },
      });
      if (existing) {
        packageData.municipeId = existing.id;
      } else {
        const normalized = entity.municipe
          .toUpperCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        const created = await this.prisma.municipe.create({
          data: { name: normalized },
        });
        packageData.municipeId = created.id;
      }
    }

    if (entity.idCard) {
      const digits = entity.idCard.replace(/\D/g, '');
      if (digits.length >= 8) {
        const existing = await this.prisma.recipient.findFirst({
          where: { idCard: { contains: digits } },
        });
        if (existing) {
          packageData.recipientId = existing.id;
        } else {
          const created = await this.prisma.recipient.create({
            data: {
              fullName: entity.fullName,
              idCard: digits,
              phone: entity.phone,
            },
          });
          packageData.recipientId = created.id;
        }
      }
    }

    packageData.address = entity.address;
    packageData.content = entity.content;
    packageData.weight = entity.weight;
    if (entity.arrivalDate)
      packageData.arrivalDate = new Date(entity.arrivalDate);

    return packageData;
  }
  async resolverBulkAiEntitiesUtility(entities: BulkAiEntities) {
    // aqui se implementara la logica de resilucion de metadatos de un bulk de entities
    /* el resultado esperado es validar los metadatos del blunk y devolver un conjunto 
    de datos donde cada uno pueda ser procesado por resolverEntity
    por lo tanto lo que queremos obtener es un array de bushinesEntity asi habriamos pasado de un blunk
    que contiene businessaiEntitis a uno que contiene businessEntities 
    procedimiento
    1 loguica de validacion de metadatos que podemos encapsular mas adelante
    en esta trabajamos con 3 datos principales la guia el etatus y la localizacion del paquete
    -proceso a seguir para la validacion:
    creamos dos variables guideId y locationId
    revisamos si el id del status es valido si lo es continuamos
    revisamos si el id la agencia es valida si lo es continuamos
    
    
    verificamos si de la localizacion trae el id y/o el valor
    si trae el id lo verificamos 
    si es valido lo agregamos al locationId y no rrevisamos el valor
    si no lo trae verificamos si hay alguna ubicacion con ese valor en el abase de datos para ello seguimos el sigueinte proceso
    El proceso de limpieza de los datos para si comparacion sera el sigiente
ubicacion
se almacenan en la base datos de la siguiente forma se transforman a mayusculas se le elimina todo tipo
de caracter especial multiples espacios se reducen a uno
por ende el proceso de normalizado a la hora de la comparacion debe ser el mismo
no obstante
a la comparacion no debe importarle si son mayusculas o minusculas R = R
ademas debe poder devolver coincidencia si el que estamos comparando esta contenido dentro de la db
ejemplo input S'anTiago  db SANTIAGO DE CUBA
coincidencia positiva
en caso de ser positiva la coincidencia timamos el id lo almacenamos en locatedId y continuamos
en caso de no encontrar coincidencia creamos la localizacion tomamos el id de la misma creada 
lo almacenamos en locatedId y continuamos

cuando veas esto te preguntaras por que verificamos la ubicacion en ambos servicios
bueno porque este deberia ser un servicio o utils reutilizable pero lo extraeremos posteriormente 
y como ambos servicios pueden procesar de lugares diferentes es mejor que ambos hagan la validacion

    la guia es un poco mas complicada
    primero verificamos si viene el id de la guia el valor ambos o ninguno o uno u otro
    si viene el id y es valido lo usamos en agencyId y no revisamos el valor
    si no trae id o no es valido comprobamos si hay valor y creamos el elemento en la base de datos
    y le asociamos el agencyId enviado
    tomamos la id de la guia creada de vuelta y la agregamos al agencyId

    fase 2
    tomamos el arreglo de packetes que viene en el bulk de datos
    y creamos un arreglo nuevo mientras recorremos el enterior y a cada pquete le agregamos el status id
    el location id y el agency id para que pueda ser procesado por resolverEntity 
    devolvemos este segundo arreglo
    */
    let guideId: string | undefined;
    let locationId: string | undefined;

    const status = await this.prisma.status.findUnique({
      where: { id: entities.statusId },
    });
    if (!status)
      throw new Error(`Status with id ${entities.statusId} not found`);

    const agency = await this.prisma.agency.findUnique({
      where: { id: entities.agencyId },
    });
    if (!agency)
      throw new Error(`Agency with id ${entities.agencyId} not found`);

    if (entities.locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: entities.locationId },
      });
      if (location) locationId = entities.locationId;
    } else if (entities.location) {
      const normalized = entities.location
        .toUpperCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      const existing = await this.prisma.location.findFirst({
        where: { name: { contains: entities.location, mode: 'insensitive' } },
      });
      if (existing) {
        locationId = existing.id;
      } else {
        const created = await this.prisma.location.create({
          data: { name: normalized },
        });
        locationId = created.id;
      }
    }

    if (entities.guideId) {
      const guide = await this.prisma.guide.findUnique({
        where: { id: entities.guideId },
      });
      if (guide) guideId = entities.guideId;
    } else if (entities.guide) {
      const created = await this.prisma.guide.create({
        data: {
          name: entities.guide,
          agencyId: entities.agencyId,
          type: entities.guideType,
        },
      });
      guideId = created.id;
    }

    const result: BusinessEntity[] = entities.packages.map((pkg) => {
      const entity = new BusinessEntity();
      entity.statusId = entities.statusId;
      entity.agencyId = entities.agencyId;
      entity.guideId = guideId;
      entity.locationId = locationId;
      entity.province = pkg.province;
      entity.municipe = pkg.municipe;
      entity.address = pkg.address;
      entity.content = pkg.content;
      entity.weight = pkg.weight;
      entity.arrivalDate = pkg.arrivalDate;
      entity.fullName = pkg.fullName;
      entity.idCard = pkg.idCard;
      entity.phone = pkg.phone;
      entity.hblCodes = pkg.hblCodes;
      return entity;
    });

    return result;
  }
}
