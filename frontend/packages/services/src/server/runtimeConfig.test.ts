import { describe, expect, it } from "vitest";

import { FrontendRuntimeConfigError, resolveFrontendRuntimeConfig } from "./index";

describe("frontend runtime config", () => {
  it("defaults to mock mode for local frontend work without backend config", () => {
    expect(resolveFrontendRuntimeConfig({ NODE_ENV: "development" })).toEqual({
      dataSource: "mock"
    });
  });

  it("defaults to backend mode when a backend URL is configured", () => {
    expect(resolveFrontendRuntimeConfig({ AIVIS_BACKEND_ORIGIN: "http://backend:7001/" })).toEqual({
      backendUrl: "http://backend:7001",
      dataSource: "backend"
    });
  });

  it("uses explicit mock mode even when a backend URL exists", () => {
    expect(
      resolveFrontendRuntimeConfig({
        AIVIS_BACKEND_ORIGIN: "http://backend:7001",
        AIVIS_FRONTEND_DATA_SOURCE: "mock"
      })
    ).toEqual({
      dataSource: "mock"
    });
  });

  it("fails safely when backend mode is requested without backend config", () => {
    expect(() => resolveFrontendRuntimeConfig({ AIVIS_FRONTEND_DATA_SOURCE: "backend" })).toThrow(FrontendRuntimeConfigError);
  });

  it("fails safely in production-like mode without backend config or explicit mock mode", () => {
    expect(() => resolveFrontendRuntimeConfig({ NODE_ENV: "production" })).toThrow(FrontendRuntimeConfigError);
  });

  it("allows explicit mock mode in production-like smoke tests", () => {
    expect(
      resolveFrontendRuntimeConfig({
        NODE_ENV: "production",
        AIVIS_FRONTEND_DATA_SOURCE: "mock"
      })
    ).toEqual({
      dataSource: "mock"
    });
  });
});
