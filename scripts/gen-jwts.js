import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET_KEY;
if (!SECRET) throw new Error("Missing SECRET_KEY");

const roles = ["Admin", "Student", "Company", "Professor"];

const tokens = {};

for (const role of roles) {
  tokens[role] = jwt.sign(
    { id: `${role}-ci`, role, verified: true },
    SECRET,
    { expiresIn: "7d" }
  );
}

console.log(JSON.stringify(tokens, null, 2));
