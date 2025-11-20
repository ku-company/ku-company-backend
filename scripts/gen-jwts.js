import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { writeFileSync } from 'fs';

dotenv.config();

const SECRET = process.env.SECRET_KEY;

const tokens = {
  "Student":   jwt.sign({ id: 1, role: "Student", verified: true }, SECRET, { expiresIn: '7d' }),
  "Professor": jwt.sign({ id: 2, role: "Professor", verified: true }, SECRET, { expiresIn: '7d' }),
  "Company":   jwt.sign({ id: 3, role: "Company", verified: true }, SECRET, { expiresIn: '7d' }),
  "Admin":     jwt.sign({ id: 4, role: "Admin", verified: true }, SECRET, { expiresIn: '7d' }),
};

writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
