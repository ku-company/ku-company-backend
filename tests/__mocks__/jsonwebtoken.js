function sign(payload, _key, _opts) {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verify(token, _key) {
  const json = Buffer.from(token, 'base64').toString('utf-8');
  return JSON.parse(json);
}

module.exports = { sign, verify, default: { sign, verify } };
