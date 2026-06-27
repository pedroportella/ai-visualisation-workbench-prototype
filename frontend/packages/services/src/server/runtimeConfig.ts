import "server-only";

export type FrontendDataSource = "mock" | "backend";

export interface FrontendRuntimeConfig {
  backendUrl?: string;
  dataSource: FrontendDataSource;
}

export class FrontendRuntimeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FrontendRuntimeConfigError";
  }
}

function normaliseBackendUrl(backendUrl: string): string {
  return backendUrl.replace(/\/$/, "");
}

function isProductionLike(env: NodeJS.ProcessEnv): boolean {
  return env.NODE_ENV === "production";
}

export function resolveFrontendRuntimeConfig(env: NodeJS.ProcessEnv = process.env): FrontendRuntimeConfig {
  const requestedDataSource = env.AIVIS_FRONTEND_DATA_SOURCE;
  const backendUrl = env.AIVIS_BACKEND_ORIGIN;

  if (requestedDataSource && requestedDataSource !== "mock" && requestedDataSource !== "backend") {
    throw new FrontendRuntimeConfigError("AIVIS frontend data source must be either 'mock' or 'backend'.");
  }

  if (requestedDataSource === "mock") {
    return {
      dataSource: "mock"
    };
  }

  if (requestedDataSource === "backend") {
    if (!backendUrl) {
      throw new FrontendRuntimeConfigError("AIVIS_BACKEND_ORIGIN is required when backend data source is requested.");
    }

    return {
      backendUrl: normaliseBackendUrl(backendUrl),
      dataSource: "backend"
    };
  }

  if (backendUrl) {
    return {
      backendUrl: normaliseBackendUrl(backendUrl),
      dataSource: "backend"
    };
  }

  if (isProductionLike(env)) {
    throw new FrontendRuntimeConfigError(
      "Production-like frontend runs require AIVIS_BACKEND_ORIGIN or an explicit AIVIS_FRONTEND_DATA_SOURCE=mock override."
    );
  }

  return {
    dataSource: "mock"
  };
}
