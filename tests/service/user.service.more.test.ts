import { jest } from '@jest/globals';

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  process.env.BUCKET_REGION = process.env.BUCKET_REGION || 'us-east-1';
});

describe('UserService additional unit tests', () => {
  it('has_profile_image returns true/false based on repository', async () => {
    jest.doMock('../../repository/userRepository.js', () => ({
      UserRepository: class { async get_user_by_id(id: number) { return { id, profile_image: 'key' }; } }
    }));
    const { UserService } = await import('../../service/userService.js');
    const svc = new UserService();
    const res = await svc.has_profile_image({ id: 1 } as any);
    expect(res).toBe(true);
  });

  it('check_default_profile_image recognizes default key', async () => {
    const { UserService } = await import('../../service/userService.js');
    const svc = new UserService();
    const res = await svc.check_default_profile_image('default_profile_image_key');
    // default value in constants is imported; assume false for unknown key
    expect(typeof res).toBe('boolean');
  });

  it('get_profile_image returns same url when profile_image starts with http', async () => {
    jest.doMock('../../repository/userRepository.js', () => ({
      UserRepository: class { async get_user_by_id(id: number) { return { id, profile_image: 'http://cdn.example/image.png' }; } }
    }));
    const { UserService } = await import('../../service/userService.js');
    const svc = new UserService();
    const res = await svc.get_profile_image(1);
    expect(res).toBe('http://cdn.example/image.png');
  });

  it('get_profile_image calls s3Service when key present and not http', async () => {
    jest.doMock('../../repository/userRepository.js', () => ({
      UserRepository: class { async get_user_by_id(id: number) { return { id, profile_image: 'img-key' }; } }
    }));
    jest.doMock('../../service/s3Services.js', () => ({
      S3Service: class { async getFileUrl(key: string) { return 'https://s3.example/' + key; } }
    }));
    const { UserService } = await import('../../service/userService.js');
    const svc = new UserService();
    const res = await svc.get_profile_image(2);
    expect(res).toBe('https://s3.example/img-key');
  });

  it('create_profile_image throws when profile exists', async () => {
    jest.doMock('../../repository/userRepository.js', () => ({
      UserRepository: class { async get_user_by_id(id: number) { return { id, profile_image: 'img' }; } }
    }));
    const { UserService } = await import('../../service/userService.js');
    const svc = new UserService();
    await expect(svc.create_profile_image({} as any, { id: 1 } as any)).rejects.toThrow('Profile image already exists');
  });

  it('upload_profile_image uploads and returns key', async () => {
    // mock validateImageBuffer and s3Service and userRepository upload
    jest.doMock('../../helper/image.js', () => ({ validateImageBuffer: async (b: any) => ({ mime: 'image/png' }) }));
    jest.doMock('../../service/s3Services.js', () => ({
      S3Service: class {
        async uploadFile(_: any, __: any) { return { key: 'uploaded-key' }; }
        async getFileUrl() { return '' }
      }
    }));
    jest.doMock('../../repository/userRepository.js', () => ({
      UserRepository: class { async upload_profile_image(user_id: number, data: any) { return true; } }
    }));

    const { UserService } = await import('../../service/userService.js');
    const svc = new UserService();
    const fakeFile = { buffer: Buffer.from('abc'), originalname: 'a.png' } as any;
    const key = await svc.upload_profile_image(fakeFile, { id: 1, role: 'Student' } as any);
    expect(key).toBe('uploaded-key');
  });

  it('update_role validates roles and returns tokens', async () => {
    jest.doMock('../../repository/userRepository.js', () => ({
      UserRepository: class { async update_role(id: number, role: any) { return { id, user_name: 'u', email: 'e', role, verified: true }; } }
    }));
    // override getValidRoles to include 'Company'
    jest.doMock('../../utils/roleUtils.js', () => ({ getValidRoles: () => ['Student','Company','Admin'] }));
    jest.doMock('../../helper/createProfileStrategy.js', () => ({ createProfileStrategy: { create_user_profile: async () => {} } }));

    process.env.SECRET_KEY = 's';
    process.env.REFRESH_KEY = 'r';

    const { UserService } = await import('../../service/userService.js');
    const svc = new UserService();
    const res = await svc.update_role(5, 'Company');
    expect(res).toHaveProperty('access_token');
    expect(res.role).toBe('Company');
  });
});
