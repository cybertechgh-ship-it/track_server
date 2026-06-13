import { ResponseHelper } from "../utils/response";

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("ResponseHelper", () => {
  describe("success", () => {
    it("should return 200 with data and message", () => {
      const res = mockResponse();
      const result = ResponseHelper.success(res, { id: 1 }, "OK");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "OK",
          data: { id: 1 },
        })
      );
      expect(result).toBe(res);
    });

    it("should accept custom status code", () => {
      const res = mockResponse();
      ResponseHelper.success(res, null, "Done", 201);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should include meta timestamp", () => {
      const res = mockResponse();
      ResponseHelper.success(res, null, "OK");
      const call = res.json.mock.calls[0][0];
      expect(call.meta.timestamp).toBeDefined();
      expect(new Date(call.meta.timestamp).getTime()).not.toBeNaN();
    });
  });

  describe("created", () => {
    it("should return 201 with data", () => {
      const res = mockResponse();
      ResponseHelper.created(res, { id: 1 }, "Created");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: "Created" })
      );
    });
  });

  describe("error", () => {
    it("should return 500 by default", () => {
      const res = mockResponse();
      ResponseHelper.error(res, "Something broke");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Something broke",
        })
      );
    });

    it("should accept custom status code and code", () => {
      const res = mockResponse();
      ResponseHelper.error(res, "Not found", 404, "NOT_FOUND");
      expect(res.status).toHaveBeenCalledWith(404);
      const call = res.json.mock.calls[0][0];
      expect(call.code).toBe("NOT_FOUND");
    });
  });

  describe("paginated", () => {
    it("should return paginated response with correct meta", () => {
      const res = mockResponse();
      const data = [{ id: 1 }, { id: 2 }];
      ResponseHelper.paginated(res, data, 10, 1, 5);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data,
          meta: expect.objectContaining({
            pagination: {
              page: 1,
              limit: 5,
              total: 10,
              pages: 2,
            },
            total: 10,
          }),
        })
      );
    });
  });
});
