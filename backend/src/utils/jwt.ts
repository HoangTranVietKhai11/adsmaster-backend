import jwt, { SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export function generateAccessToken(payload: {
    userId: string;
    email: string;
    role: string;
}): string {
    const options: SignOptions = {
        expiresIn: (process.env.JWT_ACCESS_EXPIRY || "15m") as SignOptions["expiresIn"],
    };
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, options);
}

export function generateRefreshToken(userId: string): string {
    const options: SignOptions = {
        expiresIn: (process.env.JWT_REFRESH_EXPIRY || "7d") as SignOptions["expiresIn"],
    };
    return jwt.sign({ userId, jti: uuidv4() }, process.env.JWT_REFRESH_SECRET!, options);
}

export function verifyRefreshToken(token: string): { userId: string; jti: string } {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
        userId: string;
        jti: string;
    };
}
