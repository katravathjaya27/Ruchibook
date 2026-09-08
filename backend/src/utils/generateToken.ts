import jwt from "jsonwebtoken";

/**
 * Creates a signed JSON Web Token containing the user's id and role.
 * The frontend stores this token and sends it back on every request
 * that needs to know who the user is (e.g. "Authorization: Bearer <token>").
 * The token expires after 30 days, after which the user must log in again.
 */
export const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in the environment");
  }
  return jwt.sign({ id: userId, role }, secret, { expiresIn: "30d" });
};
