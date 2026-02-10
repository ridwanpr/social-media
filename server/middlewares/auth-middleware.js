import * as jose from "jose";
import { prisma } from "../lib/prisma.js";
import { JWSSignatureVerificationFailed } from "jose/errors";

export const authMiddleware = async (req, res, next) => {
  try {
    const headers = req.headers.authorization;

    if (!headers) {
      return res.sendStatus(401);
    }

    const token = headers.split("Bearer ")[1];

    if (!token) {
      return res.sendStatus(401);
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const decoded = await jose.jwtVerify(token, secret);

    if (!decoded) {
      return res.sendStatus(401);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.payload.id,
      },
    });

    if (!user) {
      return res.sendStatus(401);
    }

    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    if (err instanceof JWSSignatureVerificationFailed) {
      return res.sendStatus(401);
    }
    return res.sendStatus(500);
  }
};

