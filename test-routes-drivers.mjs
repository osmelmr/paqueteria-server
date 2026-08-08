import 'dotenv/config';
import { PrismaService } from './dist/src/prisma/prisma.service.js';
import { RoutesService } from './dist/src/business/routes/routes.service.js';

const prisma = new PrismaService();
await prisma.$connect();
const svc = new RoutesService(prisma);

const vehicles = await prisma.vehicle.findMany({ include: { drivers: true }, take: 2 });
const v1 = vehicles[0];
const v2 = vehicles[1] ?? vehicles[0];
if (!v1) { console.log('NO HAY VEHICULOS'); await prisma.$disconnect(); process.exit(0); }
console.log('v1:', v1.name, '->', v1.drivers.map((d) => d.driverId).join(',') || 'ninguno');
console.log('v2:', v2.name, '->', v2.drivers.map((d) => d.driverId).join(',') || 'ninguno');

const route = await svc.create({
  name: 'TEST TRACE ROUTE',
  vehicleId: v1.id,
  hbls: [],
  departureDate: new Date().toISOString(),
});
console.log('1. create (sin driverIds) -> drivers:', route.drivers.map((d) => d.driverId).join(',') || 'ninguno');

const up1 = await svc.update(route.id, { name: 'TEST TRACE ROUTE 2' });
console.log('2. update mismo vehicle sin driverIds -> drivers:', up1.drivers.map((d) => d.driverId).join(',') || 'ninguno');

if (v2.id !== v1.id) {
  const up2 = await svc.update(route.id, { vehicleId: v2.id });
  console.log('3. update vehicle distinto -> drivers:', up2.drivers.map((d) => d.driverId).join(',') || 'ninguno');
}

const up3 = await svc.update(route.id, { driverIds: [] });
console.log('4. update driverIds vacio -> drivers:', up3.drivers.map((d) => d.driverId).join(',') || 'ninguno');

const up4 = await svc.update(route.id, { driverIds: v1.drivers.map((d) => d.driverId) });
console.log('5. update driverIds explicitos -> drivers:', up4.drivers.map((d) => d.driverId).join(',') || 'ninguno');

await svc.delete(route.id);
console.log('cleanup ok');
await prisma.$disconnect();
