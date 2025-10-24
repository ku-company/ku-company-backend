export function makeFakeReq(user_id: number, body: any = {}) {
  return { user: { id: user_id }, body };
}
