import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { BadRequestError } from "../errors";

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body ?? {});
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid input");
    }
    req.body = parsed.data;
    next();
  };
}
