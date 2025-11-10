export const sign = (payload: any, _key?: string, _opts?: any): string => {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

export const verify = (token: string, _key?: string): any => {
  const json = Buffer.from(token, 'base64').toString('utf-8');
  return JSON.parse(json);
};

const api = { sign, verify };
export default api;
