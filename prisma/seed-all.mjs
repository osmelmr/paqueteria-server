// seed-packages.js
import 'dotenv/config';
import { PrismaClient } from '../dist/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import crypto from 'node:crypto';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

function generateUUID() {
  return crypto.randomUUID();
}

// IDs fijos para referencias (puedes cambiarlos)
const AGENCY_AEREA_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const AGENCY_MARITIMA_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
const GUIDE_AEREA_ID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21';
const GUIDE_MARITIMA_ID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

const RECIPIENT_1_ID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31';
const RECIPIENT_2_ID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32';
const RECIPIENT_3_ID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
const RECIPIENT_4_ID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34';
const RECIPIENT_5_ID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35';

const PROVINCE_HABANA_ID = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41';
const PROVINCE_MATANZAS_ID = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42';

const MUNICIPE_HABANA_VIEJA_ID = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51';
const MUNICIPE_CENTRO_HABANA_ID = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52';
const MUNICIPE_MATANZAS_ID = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53';

const STATUS_ALMACEN_ID = 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61';
const STATUS_RUTA_ID = 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a62';
const STATUS_ENTREGADO_ID = 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a63';
const STATUS_RETENIDO_ID = 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a64';
const STATUS_ESPERA_ID = 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a65';

const LOCATION_ALMACEN_HABANA_ID = '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a71';
const LOCATION_TRANSITO_ID = '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a72';
const LOCATION_OFICINA_CENTRAL_ID = '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a73';
const LOCATION_DESTINO_ID = '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a74';

const VEHICLE_CAMION_ID = '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a81';
const VEHICLE_FURGONETA_ID = '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a82';

const DRIVER_JUAN_ID = '30eebc99-9c0b-4ef8-bb6d-6bb9bd380a91';
const DRIVER_LUIS_ID = '30eebc99-9c0b-4ef8-bb6d-6bb9bd380a92';

const ROUTE_ID = '40eebc99-9c0b-4ef8-bb6d-6bb9bd380aa1';

const PACKAGE_1_ID = '50eebc99-9c0b-4ef8-bb6d-6bb9bd380b01';
const PACKAGE_2_ID = '50eebc99-9c0b-4ef8-bb6d-6bb9bd380b02';
const PACKAGE_3_ID = '50eebc99-9c0b-4ef8-bb6d-6bb9bd380b03';
const PACKAGE_4_ID = '50eebc99-9c0b-4ef8-bb6d-6bb9bd380b04';
const PACKAGE_5_ID = '50eebc99-9c0b-4ef8-bb6d-6bb9bd380b05';

async function main() {
  console.log('🚀 Iniciando seed de paquetes, rutas y datos relacionados...');

  // ── 1. Agencias ──────────────────────────────────────
  const agencyAerea = await prisma.agency.upsert({
    where: { id: AGENCY_AEREA_ID },
    update: {},
    create: { id: AGENCY_AEREA_ID, name: 'Agencia Aérea Nacional' },
  });
  const agencyMaritima = await prisma.agency.upsert({
    where: { id: AGENCY_MARITIMA_ID },
    update: {},
    create: { id: AGENCY_MARITIMA_ID, name: 'Agencia Marítima del Caribe' },
  });
  console.log('✅ Agencias creadas.');

  // ── 2. Guías ─────────────────────────────────────────
  const guideAerea = await prisma.guide.upsert({
    where: { id: GUIDE_AEREA_ID },
    update: {},
    create: {
      id: GUIDE_AEREA_ID,
      name: 'GUIA-AER-001',
      agencyId: agencyAerea.id,
      type: 'AEREA',
      uploadedAt: new Date('2026-08-01'),
    },
  });
  const guideMaritima = await prisma.guide.upsert({
    where: { id: GUIDE_MARITIMA_ID },
    update: {},
    create: {
      id: GUIDE_MARITIMA_ID,
      name: 'GUIA-MAR-001',
      agencyId: agencyMaritima.id,
      type: 'MARITIMA',
      uploadedAt: new Date('2026-08-02'),
    },
  });
  console.log('✅ Guías creadas.');

  // ── 3. Destinatarios ─────────────────────────────────
  const recipientsData = [
    { id: RECIPIENT_1_ID, fullName: 'María García', idCard: 'ID001', phone: '+5355550001' },
    { id: RECIPIENT_2_ID, fullName: 'Pedro López', idCard: 'ID002', phone: '+5355550002' },
    { id: RECIPIENT_3_ID, fullName: 'Ana Martínez', idCard: 'ID003', phone: '+5355550003' },
    { id: RECIPIENT_4_ID, fullName: 'Carlos Rodríguez', idCard: 'ID004', phone: '+5355550004' },
    { id: RECIPIENT_5_ID, fullName: 'Luisa Fernández', idCard: 'ID005', phone: '+5355550005' },
  ];
  for (const r of recipientsData) {
    await prisma.recipient.upsert({
      where: { id: r.id },
      update: {},
      create: r,
    });
  }
  console.log('✅ Destinatarios creados.');

  // ── 4. Provincias ────────────────────────────────────
  const provinceHabana = await prisma.province.upsert({
    where: { id: PROVINCE_HABANA_ID },
    update: {},
    create: { id: PROVINCE_HABANA_ID, name: 'La Habana' },
  });
  const provinceMatanzas = await prisma.province.upsert({
    where: { id: PROVINCE_MATANZAS_ID },
    update: {},
    create: { id: PROVINCE_MATANZAS_ID, name: 'Matanzas' },
  });
  console.log('✅ Provincias creadas.');

  // ── 5. Municipios ────────────────────────────────────
  const municipeHabanaVieja = await prisma.municipe.upsert({
    where: { id: MUNICIPE_HABANA_VIEJA_ID },
    update: {},
    create: { id: MUNICIPE_HABANA_VIEJA_ID, name: 'Habana Vieja', header: true },
  });
  const municipeCentro = await prisma.municipe.upsert({
    where: { id: MUNICIPE_CENTRO_HABANA_ID },
    update: {},
    create: { id: MUNICIPE_CENTRO_HABANA_ID, name: 'Centro Habana', header: true },
  });
  const municipeMatanzas = await prisma.municipe.upsert({
    where: { id: MUNICIPE_MATANZAS_ID },
    update: {},
    create: { id: MUNICIPE_MATANZAS_ID, name: 'Matanzas', header: true },
  });
  console.log('✅ Municipios creados.');

  // ── 6. Estados ───────────────────────────────────────
  const statusAlmacen = await prisma.status.upsert({
    where: { id: STATUS_ALMACEN_ID },
    update: {},
    create: { id: STATUS_ALMACEN_ID, name: 'En almacén' },
  });
  const statusRuta = await prisma.status.upsert({
    where: { id: STATUS_RUTA_ID },
    update: {},
    create: { id: STATUS_RUTA_ID, name: 'En ruta' },
  });
  const statusEntregado = await prisma.status.upsert({
    where: { id: STATUS_ENTREGADO_ID },
    update: {},
    create: { id: STATUS_ENTREGADO_ID, name: 'Entregado' },
  });
  const statusRetenido = await prisma.status.upsert({
    where: { id: STATUS_RETENIDO_ID },
    update: {},
    create: { id: STATUS_RETENIDO_ID, name: 'Retenido en aduana' },
  });
  const statusEspera = await prisma.status.upsert({
    where: { id: STATUS_ESPERA_ID },
    update: {},
    create: { id: STATUS_ESPERA_ID, name: 'En espera de recogida' },
  });
  console.log('✅ Estados creados.');

  // ── 7. Ubicaciones ───────────────────────────────────
  const locationAlmacen = await prisma.location.upsert({
    where: { id: LOCATION_ALMACEN_HABANA_ID },
    update: {},
    create: { id: LOCATION_ALMACEN_HABANA_ID, name: 'Almacén Central Habana' },
  });
  const locationTransito = await prisma.location.upsert({
    where: { id: LOCATION_TRANSITO_ID },
    update: {},
    create: { id: LOCATION_TRANSITO_ID, name: 'En tránsito' },
  });
  const locationOficina = await prisma.location.upsert({
    where: { id: LOCATION_OFICINA_CENTRAL_ID },
    update: {},
    create: { id: LOCATION_OFICINA_CENTRAL_ID, name: 'Oficina central' },
  });
  const locationDestino = await prisma.location.upsert({
    where: { id: LOCATION_DESTINO_ID },
    update: {},
    create: { id: LOCATION_DESTINO_ID, name: 'Dirección del destinatario' },
  });
  console.log('✅ Ubicaciones creadas.');

  // ── 8. Vehículos ─────────────────────────────────────
  const vehicleCamion = await prisma.vehicle.upsert({
    where: { id: VEHICLE_CAMION_ID },
    update: {},
    create: { id: VEHICLE_CAMION_ID, name: 'Camión H-001', isActive: true },
  });
  const vehicleFurgoneta = await prisma.vehicle.upsert({
    where: { id: VEHICLE_FURGONETA_ID },
    update: {},
    create: { id: VEHICLE_FURGONETA_ID, name: 'Furgoneta F-101', isActive: true },
  });
  console.log('✅ Vehículos creados.');

  // ── 9. Conductores ──────────────────────────────────
  const driverJuan = await prisma.driver.upsert({
    where: { id: DRIVER_JUAN_ID },
    update: {},
    create: { id: DRIVER_JUAN_ID, name: 'Juan Pérez', isActive: true },
  });
  const driverLuis = await prisma.driver.upsert({
    where: { id: DRIVER_LUIS_ID },
    update: {},
    create: { id: DRIVER_LUIS_ID, name: 'Luis Gómez', isActive: true },
  });
  console.log('✅ Conductores creados.');

  // ── 10. Asignación vehículo–conductor ───────────────
  await prisma.driverVehicle.upsert({
    where: { vehicleId_driverId: { vehicleId: VEHICLE_CAMION_ID, driverId: DRIVER_JUAN_ID } },
    update: {},
    create: { vehicleId: VEHICLE_CAMION_ID, driverId: DRIVER_JUAN_ID },
  });
  await prisma.driverVehicle.upsert({
    where: { vehicleId_driverId: { vehicleId: VEHICLE_CAMION_ID, driverId: DRIVER_LUIS_ID } },
    update: {},
    create: { vehicleId: VEHICLE_CAMION_ID, driverId: DRIVER_LUIS_ID },
  });
  console.log('✅ Relaciones vehículo–conductor creadas.');

  // ── 11. RUTA IMPORTANTE ─────────────────────────────
  const route = await prisma.route.upsert({
    where: { id: ROUTE_ID },
    update: {},
    create: {
      id: ROUTE_ID,
      name: 'Ruta Habana – Matanzas (Express)',
      description: 'Entrega de paquetería urgente desde La Habana hasta Matanzas.',
      departureDate: new Date('2026-08-10T08:00:00Z'),
      vehicleId: VEHICLE_CAMION_ID,
    },
  });
  console.log('✅ Ruta creada:', route.name);

  // Asignar conductores a la ruta (Juan como principal)
  await prisma.routeDriver.upsert({
    where: { routeId_driverId: { routeId: ROUTE_ID, driverId: DRIVER_JUAN_ID } },
    update: { isPrimary: true },
    create: { routeId: ROUTE_ID, driverId: DRIVER_JUAN_ID, isPrimary: true },
  });
  await prisma.routeDriver.upsert({
    where: { routeId_driverId: { routeId: ROUTE_ID, driverId: DRIVER_LUIS_ID } },
    update: {},
    create: { routeId: ROUTE_ID, driverId: DRIVER_LUIS_ID, isPrimary: false },
  });
  console.log('✅ Conductores asignados a la ruta.');

  // ── 12. Paquetes ────────────────────────────────────
  const packagesData = [
    {
      id: PACKAGE_1_ID,
      guideId: guideAerea.id,
      recipientId: RECIPIENT_1_ID,
      provinceId: provinceHabana.id,
      municipeId: municipeHabanaVieja.id,
      address: 'Calle Obispo #123, Habana Vieja',
      weight: 2.5,
      content: 'Libros y documentos',
      anotations: 'Frágil',
      arrivalDate: new Date('2026-08-05'),
      statusId: statusAlmacen.id,
      locationId: locationAlmacen.id,
      routeId: ROUTE_ID,            // <-- asociado a la ruta importante
    },
    {
      id: PACKAGE_2_ID,
      guideId: guideAerea.id,
      recipientId: RECIPIENT_2_ID,
      provinceId: provinceMatanzas.id,
      municipeId: municipeMatanzas.id,
      address: 'Avenida Las Américas #45, Matanzas',
      weight: 5.0,
      content: 'Equipos electrónicos',
      anotations: 'Requiere firma',
      arrivalDate: new Date('2026-08-06'),
      statusId: statusRuta.id,
      locationId: locationTransito.id,
      routeId: ROUTE_ID,
    },
    {
      id: PACKAGE_3_ID,
      guideId: guideMaritima.id,
      recipientId: RECIPIENT_3_ID,
      provinceId: provinceHabana.id,
      municipeId: municipeCentro.id,
      address: 'Calle Neptuno #67, Centro Habana',
      weight: 1.2,
      content: 'Ropa y accesorios',
      arrivalDate: new Date('2026-08-07'),
      statusId: statusRetenido.id,
      locationId: locationOficina.id,
      alert: true,
      alertDescription: 'Documentación pendiente de aduana',
      routeId: null,                // sin ruta aún
    },
    {
      id: PACKAGE_4_ID,
      guideId: guideMaritima.id,
      recipientId: RECIPIENT_4_ID,
      provinceId: provinceMatanzas.id,
      municipeId: municipeMatanzas.id,
      address: 'Calle Independencia #89, Matanzas',
      weight: 8.7,
      content: 'Repuestos automotrices',
      arrivalDate: new Date('2026-08-07'),
      statusId: statusEntregado.id,
      locationId: locationDestino.id,
      routeId: null,
    },
    {
      id: PACKAGE_5_ID,
      guideId: guideAerea.id,
      recipientId: RECIPIENT_5_ID,
      provinceId: provinceHabana.id,
      municipeId: municipeHabanaVieja.id,
      address: 'Calle Mercaderes #200, Habana Vieja',
      weight: 3.3,
      content: 'Material publicitario',
      arrivalDate: new Date('2026-08-04'),
      statusId: statusEspera.id,
      locationId: locationAlmacen.id,
      routeId: ROUTE_ID,
    },
  ];

  for (const pkg of packagesData) {
    await prisma.package.upsert({
      where: { id: pkg.id },
      update: {}, // o podrías actualizar campos si prefieres
      create: {
        id: pkg.id,
        guideId: pkg.guideId,
        recipientId: pkg.recipientId,
        provinceId: pkg.provinceId,
        municipeId: pkg.municipeId,
        address: pkg.address,
        weight: pkg.weight,
        content: pkg.content,
        anotations: pkg.anotations,
        arrivalDate: pkg.arrivalDate,
        statusId: pkg.statusId,
        locationId: pkg.locationId,
        alert: pkg.alert ?? false,
        alertDescription: pkg.alertDescription,
        routeId: pkg.routeId,
      },
    });
  }
  console.log('✅ Paquetes creados (5).');

  // ── 13. Historial de estados (opcional, muestra trazabilidad) ─
  const historyEntries = [
    { packageId: PACKAGE_1_ID, statusId: STATUS_ALMACEN_ID, locationId: LOCATION_ALMACEN_HABANA_ID, createdAt: new Date('2026-08-05T10:00:00Z') },
    { packageId: PACKAGE_2_ID, statusId: STATUS_ALMACEN_ID, locationId: LOCATION_ALMACEN_HABANA_ID, createdAt: new Date('2026-08-06T09:00:00Z') },
    { packageId: PACKAGE_2_ID, statusId: STATUS_RUTA_ID, locationId: LOCATION_TRANSITO_ID, createdAt: new Date('2026-08-07T07:00:00Z') },
    { packageId: PACKAGE_3_ID, statusId: STATUS_ALMACEN_ID, locationId: LOCATION_ALMACEN_HABANA_ID, createdAt: new Date('2026-08-07T11:00:00Z') },
    { packageId: PACKAGE_3_ID, statusId: STATUS_RETENIDO_ID, locationId: LOCATION_OFICINA_CENTRAL_ID, createdAt: new Date('2026-08-07T14:00:00Z') },
    { packageId: PACKAGE_4_ID, statusId: STATUS_ALMACEN_ID, locationId: LOCATION_ALMACEN_HABANA_ID, createdAt: new Date('2026-08-07T08:00:00Z') },
    { packageId: PACKAGE_4_ID, statusId: STATUS_ENTREGADO_ID, locationId: LOCATION_DESTINO_ID, createdAt: new Date('2026-08-07T16:00:00Z') },
    { packageId: PACKAGE_5_ID, statusId: STATUS_ALMACEN_ID, locationId: LOCATION_ALMACEN_HABANA_ID, createdAt: new Date('2026-08-04T09:30:00Z') },
    { packageId: PACKAGE_5_ID, statusId: STATUS_ESPERA_ID, locationId: LOCATION_ALMACEN_HABANA_ID, createdAt: new Date('2026-08-04T12:00:00Z') },
  ];
  for (const entry of historyEntries) {
    await prisma.packageStatusHistory.create({
      data: {
        packageId: entry.packageId,
        statusId: entry.statusId,
        locationId: entry.locationId,
        createdAt: entry.createdAt,
      },
    });
  }
  console.log('✅ Historial de estados registrado.');

  // ── 14. Códigos HBL para algunos paquetes ──────────
  const hbls = [
    { packageId: PACKAGE_1_ID, hblCode: 'HBL-AER-1001' },
    { packageId: PACKAGE_2_ID, hblCode: 'HBL-AER-1002' },
    { packageId: PACKAGE_3_ID, hblCode: 'HBL-MAR-2001' },
    { packageId: PACKAGE_4_ID, hblCode: 'HBL-MAR-2002' },
    { packageId: PACKAGE_5_ID, hblCode: 'HBL-AER-1003' },
  ];
  for (const hbl of hbls) {
    await prisma.packageHbl.upsert({
      where: { hblCode: hbl.hblCode },
      update: {},
      create: hbl,
    });
  }
  console.log('✅ Códigos HBL asignados.');

  console.log('\n✨ Seed de paquetería completado exitosamente.');
  console.log('   📦 5 paquetes creados.');
  console.log('   🚚 1 ruta importante: "Ruta Habana – Matanzas (Express)"');
  console.log('   🚛 Vehículo: Camión H-001');
  console.log('   👨‍✈️ Conductores: Juan Pérez (principal), Luis Gómez');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });