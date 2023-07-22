import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtSecret } from "../configuration/connection";

export const authorization = (context: any) => {

  const {token}=context;
  if (!token) {
    throw new Error("No token provided");
  }
  try {
    const secret = jwtSecret;
    const decoded = jwt.verify(token, secret,{ algorithms: ['HS256'] }) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

module.exports = { authorization };
