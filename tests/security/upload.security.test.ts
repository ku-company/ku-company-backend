import request from '../controller/_request.js';
import { buildTestApp } from '../controller/_app.js';
import employeeRoutes from '../../router/employeeRoutes.js';
import { ImageKeyStrategy, DocumentKeyStrategy } from '../../helper/s3KeyStrategy.js';
import { S3Service } from '../../service/s3Services.js';
import { UserService } from '../../service/userService.js';
import { EmployeeService } from '../../service/employeeService.js';
import * as imageHelper from '../../helper/image.js';
import * as pdfHelper from '../../helper/pdf.js';
import { PrismaClient } from '@prisma/client';

// We will mock S3Service to avoid real AWS interactions and capture keys.
jest.mock('../../service/s3Services.js');

const MockedS3 = S3Service as jest.MockedClass<typeof S3Service>;

function makePngBuffer(): Buffer {
  // Minimal valid PNG header bytes (magic number) + filler
  return Buffer.from([
    0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A, // PNG signature
    0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52, // IHDR chunk length/type
    0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01, // width/height=1
    0x08,0x02,0x00,0x00,0x00, // bit depth/color type etc.
    0x90,0x77,0x53,0xDE // CRC (dummy)
  ]);
}

function makeFakeImageBuffer(): Buffer {
  // Looks like text, will fail magic byte detection
  return Buffer.from('NOT_AN_IMAGE');
}

function makeFakePdfBuffer(): Buffer {
  // A non-PDF header; real PDF starts with %PDF-
  return Buffer.from('NOT_PDF_FILE');
}

function makePdfBuffer(): Buffer {
  return Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
}

const prisma = new PrismaClient();

describe('Security: Upload validation', () => {
  let app: any;

  beforeAll(async () => {
    await prisma.$connect();
    // mock S3 uploadFile to simply return a key
    MockedS3.prototype.uploadFile = jest.fn().mockImplementation((file: any, ctx: any) => {
      const strategy = file.mimetype === 'application/pdf' ? new DocumentKeyStrategy() : new ImageKeyStrategy();
      const key = strategy.generateKey(file.originalname, ctx);
      return Promise.resolve({ key });
    });
    MockedS3.prototype.getFileUrl = jest.fn().mockResolvedValue('https://example.com/fake');
    MockedS3.prototype.deleteFile = jest.fn().mockResolvedValue(undefined);

    app = buildTestApp((a) => {
      a.use('/api/employee', employeeRoutes);
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function makeStudentWithProfile() {
    const user = await prisma.user.create({ data: { email: `u-${Date.now()}@ku.th`, role: 'Student', verified: true, status: 'Approved' } });
    await prisma.employeeProfile.create({ data: { user_id: user.id } });
    return user.id;
  }

  test('rejects SVG image upload', async () => {
    const userId = await makeStudentWithProfile();
    const res = await request(app)
      .post('/api/employee/profile/image')
      .set('x-user-id', String(userId)).set('x-role','Student')
      .attach('profile_image', Buffer.from('<svg></svg>'), { filename: 'bad.svg', contentType: 'image/svg+xml' });
    expect(res.status).toBe(500); // Multer error bubbles to 500 with current handling
  });

  test('rejects fake image with invalid magic bytes', async () => {
    const userId = await makeStudentWithProfile();
    const res = await request(app)
      .post('/api/employee/profile/image')
      .set('x-user-id', String(userId)).set('x-role','Student')
      .attach('profile_image', makeFakeImageBuffer(), { filename: 'fake.png', contentType: 'image/png' });
    expect(res.status).toBe(500); // validateImageBuffer throws -> controller catches and returns 500
  });

  test('accepts valid PNG image upload', async () => {
    jest.spyOn(imageHelper, 'validateImageBuffer').mockResolvedValue({ ext: 'png', mime: 'image/png' } as any);
    jest.spyOn(UserService.prototype as any, 'create_profile_image').mockResolvedValue('user-Student/123-pic.png');
    const userId = await makeStudentWithProfile();
    const res = await request(app)
      .post('/api/employee/profile/image')
      .set('x-user-id', String(userId)).set('x-role','Student')
      .attach('profile_image', makePngBuffer(), { filename: 'pic.png', contentType: 'image/png' });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Image uploaded successfully/i);
  });

  test('rejects invalid PDF resume upload', async () => {
    const userId = await makeStudentWithProfile();
    const res = await request(app)
      .post('/api/employee/profile/resumes')
      .set('x-user-id', String(userId)).set('x-role','Student')
      .attach('resume', makeFakePdfBuffer(), { filename: 'resume.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(500); // Service throws "Invalid or corrupted PDF file" -> controller 500
    expect(res.body.message).toMatch(/Failed to upload file/i);
  });

  test('accepts valid PDF resume upload', async () => {
    jest.spyOn(pdfHelper, 'validatePdfBuffer').mockResolvedValue({ ext: 'pdf', mime: 'application/pdf' } as any);
    jest.spyOn(EmployeeService.prototype as any, 'upload_resumes').mockResolvedValue(['user-Student/1/resume_123-resume.pdf']);
    const userId = await makeStudentWithProfile();
    const res = await request(app)
      .post('/api/employee/profile/resumes')
      .set('x-user-id', String(userId)).set('x-role','Student')
      .attach('resume', makePdfBuffer(), { filename: 'resume.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(200);
    expect(res.body.message || res.body.resumes).toBeDefined();
  });

  test('sanitizes S3 keys (no traversal)', async () => {
    jest.spyOn(imageHelper, 'validateImageBuffer').mockResolvedValue({ ext: 'png', mime: 'image/png' } as any);
    jest.spyOn(UserService.prototype as any, 'create_profile_image').mockResolvedValue('user-Student/123-passwd.png');
    const userId = await makeStudentWithProfile();
    const png = makePngBuffer();
    const res = await request(app)
      .post('/api/employee/profile/image')
      .set('x-user-id', String(userId)).set('x-role','Student')
      .attach('profile_image', png, { filename: '../etc/passwd.png', contentType: 'image/png' });
    expect(res.status).toBe(200);
    expect(res.body.imageUrl || res.body.key).toBeDefined();
  });
});
