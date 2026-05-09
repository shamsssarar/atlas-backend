import { Request, Response, NextFunction } from "express";
import { auth } from "../config/firebase";
import { AppError } from "../errorHelpers/AppError";

export interface AuthenticatedUser {
  uid: string;
  email?: string | undefined;
}

// Extend the Express Request interface globally to include the user context
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Express middleware to verify Firebase ID tokens.
 * Enforces authentication and attaches the decoded user context to `req.user`.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        401,
        "Unauthorized: Missing or malformed Authorization header",
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError(401, "Unauthorized: Token missing from header");
    }

    // Verify token and explicitly check if it was revoked (industry standard for strict security)
    const decodedToken = await auth.verifyIdToken(token, true);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error: any) {
    if (error.code === "auth/id-token-expired") {
      next(new AppError(401, "Unauthorized: Token Expired"));
    } else if (error.code === "auth/id-token-revoked") {
      next(new AppError(401, "Unauthorized: Token Revoked"));
    } else {
      next(new AppError(401, "Unauthorized: Invalid Token"));
    }
  }
};
