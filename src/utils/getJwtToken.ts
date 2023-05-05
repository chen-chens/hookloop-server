import jwt from "jsonwebtoken";

const getJwtToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY!, { expiresIn: process.env.JWT_EXPIRE_DAY! });
};

export default getJwtToken;
