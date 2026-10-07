import { describe, it, expect, vi } from "vitest";
import { authorizeRole } from "./authorize.js";
import { Request, Response, NextFunction } from "express";

describe("authorizeRole middleware", () => {
  it("should call next() with AppError if req.user is undefined", () => {
    const middleware = authorizeRole(["OWNER"]);
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn();

    middleware(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Authentication required",
        statusCode: 401,
      })
    );
  });

  it("should call next() if req.user.role is in allowedRoles", () => {
    const middleware = authorizeRole(["OWNER", "EMPLOYEE"]);
    const req = { user: { role: "EMPLOYEE" } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    middleware(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
});

import { authorizeBranchAccess } from "./authorize.js";

describe("authorizeBranchAccess middleware", () => {
  it("should return 401 if user is not authenticated", () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn();

    authorizeBranchAccess(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Authentication required",
        statusCode: 401,
      })
    );
  });

  it("should pass for OWNER role regardless of target branch", () => {
    const req = {
      user: { role: "OWNER", branchId: null },
      params: { branchId: "some-branch-id" },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    authorizeBranchAccess(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith();
  });

  it("should pass for EMPLOYEE if requested branch matches session branch", () => {
    const req = {
      user: { role: "EMPLOYEE", branchId: "branch-A" },
      params: { branchId: "branch-A" },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    authorizeBranchAccess(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith();
  });

  it("should fail for EMPLOYEE if requested branch does not match session branch", () => {
    const req = {
      user: { role: "EMPLOYEE", branchId: "branch-A" },
      params: { branchId: "branch-B" },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    authorizeBranchAccess(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "You do not have permission to access this branch's data",
        statusCode: 403,
      })
    );
  });

  it("should pass for EMPLOYEE if no branch is explicitly requested", () => {
    const req = {
      user: { role: "EMPLOYEE", branchId: "branch-A" },
      params: {},
      body: {},
      query: {},
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    authorizeBranchAccess(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith();
  });
});
