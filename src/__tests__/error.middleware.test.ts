import { asyncHandler, globalErrorHandler } from "../middlewares/error.middleware";
import { AppError } from "../utils/errors";

describe("asyncHandler", () => {
  it("should catch async errors and pass to next", async () => {
    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();

    const asyncFn = async () => {
      throw new Error("Async error");
    };

    await asyncHandler(asyncFn)(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe("Async error");
  });

  it("should work with synchronous functions", async () => {
    const req = {} as any;
    const res = { json: jest.fn() } as any;
    const next = jest.fn();

    const syncFn = (req: any, res: any) => {
      res.json({ ok: true });
    };

    await asyncHandler(syncFn)(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("globalErrorHandler", () => {
  const mockReq = {
    url: "/api/test",
    method: "GET",
    ip: "127.0.0.1",
    get: jest.fn().mockReturnValue("test-agent"),
  } as any;

  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const next = jest.fn();

  it("should handle AppError with correct status code", () => {
    const res = mockRes();
    const error = new AppError("Not found", 404, "NOT_FOUND");

    globalErrorHandler(error, mockReq, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Not found",
        code: "NOT_FOUND",
      })
    );
  });

  it("should handle generic errors with 500", () => {
    const res = mockRes();
    const error = new Error("Something unexpected");

    globalErrorHandler(error, mockReq, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      })
    );
  });

  it("should handle JWT errors", () => {
    const res = mockRes();
    const error = new Error("jwt malformed");
    error.name = "JsonWebTokenError";

    globalErrorHandler(error, mockReq, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "INVALID_TOKEN",
      })
    );
  });

  it("should handle token expired errors", () => {
    const res = mockRes();
    const error = new Error("jwt expired");
    error.name = "TokenExpiredError";

    globalErrorHandler(error, mockReq, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "TOKEN_EXPIRED",
      })
    );
  });
});
