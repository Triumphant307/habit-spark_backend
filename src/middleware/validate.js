import { AppError } from "../utils/errors.js";

/**
 * Reusable validation middleware factory.
 * Accepts a Zod schema, runs safeParse on req.body, and either:
 *   - calls next() with the parsed (coerced) data attached to req.body, or
 *   - calls next(AppError) with a 400 and all validation messages joined.
 *
 * @param {import("zod").ZodSchema} schema
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Zod v4+: error.issues (renamed from error.errors in v3)
    const message = result.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");

    return next(new AppError(message, 400));
  }

  // Replace req.body with the parsed (coerced + stripped) data
  req.body = result.data;
  next();
};
