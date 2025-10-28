import * as supertest from 'supertest';

// ESM/CJS interop: supertest may be a default export or the module itself as a function
const request: any = ((supertest as any)?.default ?? (supertest as any));

export default request;
