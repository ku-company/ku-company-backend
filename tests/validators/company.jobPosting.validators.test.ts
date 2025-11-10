import request from '../controller/_request.js';
import { buildTestApp } from '../controller/_app.js';
// Mock multer to avoid memoryStorage undefined issues in isolated validator tests
jest.mock('multer', () => () => ({ single: () => (_req: any, _res: any, next: any) => next() }));
jest.mock('../../middlewares/uploadImageMiddleware', () => ({ uploadImage: { single: () => (_req: any, _res: any, next: any) => next() } }));
import companyRoutes from '../../router/companyRoutes.js';
import { CompanyService } from '../../service/companyService.js';

describe('Validators: Company Job Postings', () => {
  const app = buildTestApp((a) => {
    a.use('/api/company', companyRoutes);
  });

  describe('create job posting', () => {
    it('rejects invalid position', async () => {
      const res = await request(app)
        .post('/api/company/job-postings')
        .set('x-user-id', '1')
        .set('x-role', 'Company')
        .send({ description: 'd', jobType: 'FullTime', position: 'NotARealPosition', available_position: 1 });
      expect(res.status).toBe(400);
      expect(res.body?.message).toMatch(/Invalid position|Invalid job type/);
    });

    it('rejects invalid available_position', async () => {
      const res = await request(app)
        .post('/api/company/job-postings')
        .set('x-user-id', '1')
        .set('x-role', 'Company')
        .send({ description: 'd', jobType: 'FullTime', position: 'Backend_Developer', available_position: 0 });
      expect(res.status).toBe(400);
      expect(res.body?.message).toMatch(/Invalid available position/);
    });

    it('accepts minimal valid payload', async () => {
      const spy = jest.spyOn(CompanyService.prototype, 'create_job_posting').mockResolvedValue({ id: 77 } as any);
      const res = await request(app)
        .post('/api/company/job-postings')
        .set('x-user-id', '1')
        .set('x-role', 'Company')
        .send({ description: 'd', jobType: 'FullTime', position: 'Backend_Developer', available_position: 1 });
      expect(res.status).toBe(201);
      expect(res.body?.data?.id).toBe(77);
      spy.mockRestore();
    });
  });

  describe('update job posting', () => {
    it('rejects invalid id param', async () => {
      const res = await request(app)
        .patch('/api/company/job-postings/abc')
        .set('x-user-id', '1')
        .set('x-role', 'Company')
        .send({ description: 'd2' });
      expect(res.status).toBe(400);
      expect(res.body?.message).toMatch(/Invalid job posting ID/);
    });

    it('accepts partial valid update', async () => {
      const spy = jest.spyOn(CompanyService.prototype, 'update_job_posting').mockResolvedValue({ id: 77, description: 'd2' } as any);
      const res = await request(app)
        .patch('/api/company/job-postings/77')
        .set('x-user-id', '1')
        .set('x-role', 'Company')
        .send({ description: 'd2' });
      expect(res.status).toBe(200);
      expect(res.body?.data?.description).toBe('d2');
      spy.mockRestore();
    });
  });
});
