import type { Express, Response, NextFunction } from 'express';
import * as ExpressPkg from 'express';
// install cookie-parser in the test app so `req.cookies` exists for controllers that read it
// use require to avoid ESM/CJS interop issues in the test runtime
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParserImport = require('cookie-parser');
const cookieParser = (cookieParserImport && cookieParserImport.default) || cookieParserImport;

// Fake auth middleware for tests: sets req.user from headers or sensible defaults
export function buildTestApp(setup?: (app: Express) => void) {
  const express: any = (ExpressPkg as any).default || (ExpressPkg as any);
  const app: any = express();
  app.use(express.json());
  app.use(cookieParser());

  app.use((req: any, _res: Response, next: NextFunction) => {
    const userId = Number(req.header('x-user-id')) || 0;
    const role = (req.header('x-role') as string) || 'Unknown';
    const verifiedHeader = req.header('x-verified');
    const verified = verifiedHeader ? verifiedHeader === 'true' : true;
    req.user = { id: userId, role, verified };
    next();
  });

  if (setup) setup(app);
  return app;
}
