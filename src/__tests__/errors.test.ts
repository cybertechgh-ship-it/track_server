import { AppError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError } from "../utils/errors";

describe("AppError", () => {
  it("should create an error with message, statusCode, and code", () => {
    const error = new AppError("Something went wrong", 500, "INTERNAL_ERROR");
    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.isOperational).toBe(true);
    expect(error).toBeInstanceOf(Error);
  });

  it("should capture stack trace", () => {
    const error = new AppError("Test", 400);
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("Test");
    expect(error.stack).toContain("errors.test.ts");
  });

  it("should work without code", () => {
    const error = new AppError("Bad request", 400);
    expect(error.code).toBeUndefined();
  });
});

describe("ValidationError", () => {
  it("should create 400 error with VALIDATION_ERROR code", () => {
    const error = new ValidationError("Invalid input");
    expect(error.message).toBe("Invalid input");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
  });
});

describe("NotFoundError", () => {
  it("should create 404 error with resource name", () => {
    const error = new NotFoundError("User");
    expect(error.message).toBe("User not found");
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
  });
});

describe("UnauthorizedError", () => {
  it("should create 401 error with default message", () => {
    const error = new UnauthorizedError();
    expect(error.message).toBe("Unauthorized");
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("UNAUTHORIZED");
  });

  it("should create 401 error with custom message", () => {
    const error = new UnauthorizedError("Invalid token");
    expect(error.message).toBe("Invalid token");
  });
});

describe("ForbiddenError", () => {
  it("should create 403 error with default message", () => {
    const error = new ForbiddenError();
    expect(error.message).toBe("Forbidden");
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("FORBIDDEN");
  });
});

describe("ConflictError", () => {
  it("should create 409 error", () => {
    const error = new ConflictError("Email already exists");
    expect(error.message).toBe("Email already exists");
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe("CONFLICT");
  });
});
