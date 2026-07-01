import { log } from "@/lib/support/log";
import { trim } from "@/lib/support/string";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type CreateFetchClientType = {
  baseUrl: string;
} & OptionsType &
  ExtraOptionsType &
  HooksType;

type OptionsType = {
  options?: RequestInit;
};

type ExtraOptionsType = {
  timeout?: number;
  isDevModeEnabled?: boolean;
};

type onErrorType<T> = (response: Response) => T;

type HooksType = {
  middleware?: BeforeRequestType[];
  beforeResponse?: BeforeResponseType[];
};

type BeforeRequestType = (config: RequestInit) => RequestInit;

type BeforeResponseType = (response: Response) => Response;

type CreateRequestType<ErrorT> = {
  endpoint: string;
  config?: OptionsType & ExtraOptionsType;
  onError?: onErrorType<ErrorT>;
};

type ApiSuccess<T> = Omit<Response, "json"> & {
  json: () => Promise<T>;
};

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const DEFAULT_TIMEOUT = 10000; // ms
const DEFAULT_DEV_MODE_ENALBED = false;

class CreateFetchClient {
  baseUrl: string = "";
  config: RequestInit = {};
  extraOptions: ExtraOptionsType = {};
  middlewares: BeforeRequestType[] = [];
  beforeResponses: BeforeResponseType[] = [];

  constructor({ baseUrl, options, timeout, isDevModeEnabled, middleware, beforeResponse }: CreateFetchClientType) {
    this.setDefualt(baseUrl, options, timeout, isDevModeEnabled, middleware, beforeResponse);
  }

  create() {
    return {
      get: <T, ErrorT = unknown>({ endpoint, config, onError }: CreateRequestType<ErrorT>) => {
        return this.createRequest<T, ErrorT>("GET", endpoint, config, onError);
      },
      post: <T, ErrorT = unknown>({ endpoint, config, onError }: CreateRequestType<ErrorT>) => {
        return this.createRequest<T, ErrorT>("POST", endpoint, config, onError);
      },
      put: <T, ErrorT = unknown>({ endpoint, config, onError }: CreateRequestType<ErrorT>) => {
        return this.createRequest<T, ErrorT>("PUT", endpoint, config, onError);
      },

      patch: <T, ErrorT = unknown>({ endpoint, config, onError }: CreateRequestType<ErrorT>) => {
        return this.createRequest<T, ErrorT>("PATCH", endpoint, config, onError);
      },
      delete: <T, ErrorT = unknown>({ endpoint, config, onError }: CreateRequestType<ErrorT>) => {
        return this.createRequest<T, ErrorT>("DELETE", endpoint, config, onError);
      },
    };
  }

  private async createRequest<T, ErrorT>(
    method: Method,
    endpoint: string,
    config: OptionsType & ExtraOptionsType = {},
    onError?: onErrorType<ErrorT>,
  ) {
    const { options, isDevModeEnabled, timeout } = config;

    const devModeStatus = isDevModeEnabled ?? this.extraOptions.isDevModeEnabled;

    let requestConfig = { ...this.config };
    this.middlewares.forEach((middleware) => (requestConfig = middleware(requestConfig)));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout ?? this.extraOptions.timeout);

    this.log(this.baseUrl, devModeStatus);
    this.log(requestConfig, devModeStatus);
    this.log(`timeout : ${timeout ?? this.extraOptions.timeout}`, devModeStatus);

    try {
      let response = await fetch(this.resolveUrl(this.baseUrl, endpoint), {
        method,
        ...requestConfig,
        ...options,
        headers: {
          ...requestConfig.headers,
          ...options?.headers,
        },
        signal: controller.signal,
      });

      this.beforeResponses.forEach((beforeResponse) => (response = beforeResponse(response)));

      if (!response.ok) {
        const errorData = await response.json();
        if (onError) {
          onError(response);
        }

        throw new ApiError(`Request failed with status code ${response.status}`, response.status, response.statusText, errorData);
      }

      return response as ApiSuccess<T>;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw new ApiError("Request timeout", 408, "Request Timeout", null);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  private log(message: unknown, devMode?: boolean) {
    const isEnabled = devMode ?? this.extraOptions.isDevModeEnabled;

    if (!isEnabled) {
      return;
    }

    log(message);
  }

  private resolveUrl(baseUrl: string, endpoint: string) {
    const url = endpoint.startsWith("http") ? endpoint : `${trim(baseUrl, "/")}/${trim(endpoint, "/")}`;
    return new URL(url);
  }

  private setDefualt(
    baseUrl: string,
    options?: RequestInit,
    timeout?: number,
    isDevModeEnabled?: boolean,
    middleware?: BeforeRequestType[],
    beforeResponse?: BeforeResponseType[],
  ) {
    this.baseUrl = baseUrl;
    this.config = { ...options };
    this.extraOptions = {
      timeout: timeout ?? DEFAULT_TIMEOUT,
      isDevModeEnabled: isDevModeEnabled ?? DEFAULT_DEV_MODE_ENALBED,
    };
    this.middlewares = middleware ?? [];
    this.beforeResponses = beforeResponse ?? [];
  }
}

export { CreateFetchClient };
