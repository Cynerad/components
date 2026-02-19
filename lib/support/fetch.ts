import { trim } from "@/lib/support/string";

type QueryParams = string | Record<string, string | number | boolean | null | undefined> | string[][] | URLSearchParams;

type FetchClientConfig = {
  baseUrl: string;
  headers?: HeadersInit;
};

type ResponseType = "json" | "text" | "blob" | "arrayBuffer" | "response";

type RequestOptions = {
  headers?: HeadersInit;
  params?: QueryParams;
  responseType?: ResponseType;
} & Omit<RequestInit, "method" | "headers">;

class FetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response: Response,
  ) {
    super(message);
    this.name = "FetchError";
  }
}

function createFetchClient({ baseUrl, headers: defaultHeaders = {} }: FetchClientConfig) {
  const normalizeUrl = (path: string, params?: QueryParams): string => {
    const cleanBase = trim(baseUrl, "/");
    const cleanPath = trim(path, "/");
    const url = new URL(`${cleanBase}/${cleanPath}`);

    if (params) {
      url.search = params instanceof URLSearchParams ? params.toString() : new URLSearchParams(params as Record<string, string>).toString();
    }

    return url.toString();
  };

  const parseResponse = async <T>(response: Response, responseType: ResponseType = "json"): Promise<T> => {
    switch (responseType) {
      case "json":
        return await response.json();
      case "text":
        return (await response.text()) as T;
      case "blob":
        return (await response.blob()) as T;
      case "arrayBuffer":
        return (await response.arrayBuffer()) as T;
      case "response":
        return response as T;
      default:
        return await response.json();
    }
  };

  const request = async <T>(method: string, path: string, options: RequestOptions = {}): Promise<T> => {
    const { params, headers: customHeaders, responseType = "json", ...fetchOptions } = options;

    const url = normalizeUrl(path, params);

    const response = await fetch(url, {
      method,
      headers: {
        ...defaultHeaders,
        ...customHeaders,
      },
      ...fetchOptions,
    });

    if (!response.ok) {
      throw new FetchError(`Request failed: ${response.status} ${response.statusText}`, response.status, response.statusText, response);
    }

    return parseResponse<T>(response, responseType);
  };

  const requestWithBody = <T>(method: string, path: string, body?: unknown, options: RequestOptions = {}): Promise<T> => {
    const isFormData = body instanceof FormData;
    const headers: HeadersInit = {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...options.headers,
    };

    return request<T>(method, path, {
      ...options,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      headers,
    });
  };

  return {
    get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),

    post: <T>(path: string, body?: unknown, options?: RequestOptions) => requestWithBody<T>("POST", path, body, options),

    put: <T>(path: string, body?: unknown, options?: RequestOptions) => requestWithBody<T>("PUT", path, body, options),

    patch: <T>(path: string, body?: unknown, options?: RequestOptions) => requestWithBody<T>("PATCH", path, body, options),

    delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
  };
}

export { createFetchClient, FetchError };
export type { FetchClientConfig, QueryParams, RequestOptions, ResponseType };
