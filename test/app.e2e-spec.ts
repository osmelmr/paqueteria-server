import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Business Modules (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let statusId: string;
  let locationId: string;
  let provinceId: string;
  let recipientId: string;
  let packageId: string;
  let guideId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth — login as admin', () => {
    it('POST /auth/login — returns access token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin123' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      token = res.body.accessToken;
    });
  });

  describe('Statuses (read-only)', () => {
    it('GET /statuses — returns all seeded statuses', async () => {
      const res = await request(app.getHttpServer())
        .get('/statuses')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const names = res.body.map((s: any) => s.name);
      expect(names).toContain('entregando');
      expect(names).toContain('trasladando');
      expect(names).toContain('almacenado');
      expect(names).toContain('entregado');
      expect(names).toContain('perdido');

      const almacenado = res.body.find((s: any) => s.name === 'almacenado');
      statusId = almacenado.id;
    });

    it('GET /statuses?category=almacen — filters by category', async () => {
      const res = await request(app.getHttpServer())
        .get('/statuses?category=almacen')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.every((s: any) => s.category === 'almacen')).toBe(true);
    });
  });

  describe('Locations (CRUD)', () => {
    it('GET /locations — returns all seeded locations', async () => {
      const res = await request(app.getHttpServer())
        .get('/locations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const names = res.body.map((l: any) => l.name);
      expect(names).toContain('Almacén Habana');
      expect(names).toContain('En camino');
      expect(names).toContain('Entregado al cliente');
      expect(names).toContain('Desconocido');

      const habana = res.body.find((l: any) => l.name === 'Almacén Habana');
      locationId = habana.id;
    });

    it('POST /locations — creates a new location', async () => {
      const res = await request(app.getHttpServer())
        .post('/locations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Almacén Guantánamo', type: 'almacen' })
        .expect(201);

      expect(res.body.name).toBe('Almacén Guantánamo');
    });

    it('PATCH /locations/:id — updates a location', async () => {
      const all = await request(app.getHttpServer())
        .get('/locations')
        .set('Authorization', `Bearer ${token}`);

      const guantanamo = all.body.find((l: any) => l.name === 'Almacén Guantánamo');
      await request(app.getHttpServer())
        .patch(`/locations/${guantanamo.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Almacén Guantánamo (actualizado)' })
        .expect(200);
    });
  });

  describe('Provinces (CRUD)', () => {
    it('POST /provinces — creates a province', async () => {
      const res = await request(app.getHttpServer())
        .post('/provinces')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Matanzas' })
        .expect(201);

      expect(res.body.name).toBe('Matanzas');
      provinceId = res.body.id;
    });

    it('GET /provinces — lists all provinces', async () => {
      const res = await request(app.getHttpServer())
        .get('/provinces')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.some((p: any) => p.name === 'Matanzas')).toBe(true);
      expect(res.body.some((p: any) => p.name === 'La Habana')).toBe(true);
    });
  });

  describe('Recipients (CRUD + upsert)', () => {
    it('POST /recipients — creates a recipient', async () => {
      const res = await request(app.getHttpServer())
        .post('/recipients')
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName: 'Juan Pérez', idCard: '12345678901', phone: '555-0101' })
        .expect(201);

      expect(res.body.fullName).toBe('Juan Pérez');
      recipientId = res.body.id;
    });

    it('GET /recipients — paginated list', async () => {
      const res = await request(app.getHttpServer())
        .get('/recipients?page=1&limit=5')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });

    it('GET /recipients?search=Pérez — filters by search', async () => {
      const res = await request(app.getHttpServer())
        .get('/recipients?search=Pérez')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Packages (CRUD + status update)', () => {
    it('POST /packages — creates a package with HBLs', async () => {
      const res = await request(app.getHttpServer())
        .post('/packages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipientId,
          provinceId,
          addressDetail: 'Calle 123, Centro Habana',
          weight: 5.5,
          contentDescription: 'Ropa y zapatos',
          statusId,
          locationId,
          isOrphan: true,
          hbls: ['HBL-001', 'HBL-002'],
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.hbls).toHaveLength(2);
      expect(res.body.isOrphan).toBe(true);
      packageId = res.body.id;
    });

    it('GET /packages — lists packages with relations', async () => {
      const res = await request(app.getHttpServer())
        .get('/packages')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const pkg = res.body.find((p: any) => p.id === packageId);
      expect(pkg).toBeDefined();
      expect(pkg.recipient).toBeDefined();
      expect(pkg.province).toBeDefined();
      expect(pkg.status).toBeDefined();
      expect(pkg.location).toBeDefined();
    });

    it('GET /packages/:id — package detail', async () => {
      const res = await request(app.getHttpServer())
        .get(`/packages/${packageId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.id).toBe(packageId);
      expect(res.body.hbls).toHaveLength(2);
    });

    it('GET /packages?hbl=HBL-001 — finds by HBL', async () => {
      const res = await request(app.getHttpServer())
        .get('/packages?hbl=HBL-001')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].hbls.some((h: any) => h.hblCode === 'HBL-001')).toBe(true);
    });

    it('PATCH /packages/:id/status — updates status and location', async () => {
      const allStatuses = await request(app.getHttpServer())
        .get('/statuses')
        .set('Authorization', `Bearer ${token}`);
      const entregandoStatus = allStatuses.body.find((s: any) => s.name === 'entregando');

      const allLocations = await request(app.getHttpServer())
        .get('/locations')
        .set('Authorization', `Bearer ${token}`);
      const enCamino = allLocations.body.find((l: any) => l.name === 'En camino');

      const res = await request(app.getHttpServer())
        .patch(`/packages/${packageId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ statusId: entregandoStatus.id, locationId: enCamino.id })
        .expect(200);

      expect(res.body.status.name).toBe('entregando');
      expect(res.body.location.name).toBe('En camino');
    });

    it('PATCH /packages/:id — updates package fields', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/packages/${packageId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ weight: 8.2, contentDescription: 'Electrodomésticos' })
        .expect(200);

      expect(res.body.weight).toBe('8.2'); // Decimal returns as string
      expect(res.body.contentDescription).toBe('Electrodomésticos');
    });
  });

  describe('Guides', () => {
    it('POST /guides — creates a manual guide', async () => {
      const res = await request(app.getHttpServer())
        .post('/guides')
        .set('Authorization', `Bearer ${token}`)
        .send({ externalRef: 'REF-001', agency: 'DHL' })
        .expect(201);

      expect(res.body.externalRef).toBe('REF-001');
      guideId = res.body.id;
    });

    it('GET /guides — lists guides with package count', async () => {
      const res = await request(app.getHttpServer())
        .get('/guides')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.some((g: any) => g._count?.packages >= 0)).toBe(true);
    });

    it('POST /guides/upload — returns empty preview (placeholder)', async () => {
      const res = await request(app.getHttpServer())
        .post('/guides/upload')
        .set('Authorization', `Bearer ${token}`)
        .send({ rows: ['dato1', 'dato2'] })
        .expect(201);

      expect(res.body).toEqual([]);
    });

    it('POST /guides/confirm — returns not implemented error', async () => {
      await request(app.getHttpServer())
        .post('/guides/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({ externalRef: 'REF-002', agency: 'Test', packages: [] })
        .expect(500);
    });
  });

  describe('Cleanup — teardown test data', () => {
    it('DELETE /packages/:id — deletes package and its HBLs', async () => {
      await request(app.getHttpServer())
        .delete(`/packages/${packageId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/packages/${packageId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('DELETE /guides/:id — deletes guide', async () => {
      await request(app.getHttpServer())
        .delete(`/guides/${guideId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('DELETE /recipients/:id — deletes recipient', async () => {
      await request(app.getHttpServer())
        .delete(`/recipients/${recipientId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('DELETE /provinces/:id — deletes province', async () => {
      await request(app.getHttpServer())
        .delete(`/provinces/${provinceId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
