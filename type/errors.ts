type SuccessResponse<T> = {
  data: T;
  message: string;
  success: true;
  status: number;
};

type ErrorResponse = {
  message: string;
  success: false;
  status: number;
};

type AuthenticationResponse = {
  message: string;
  status: 401;
};

type AuthorizationResponse = {
  message: string;
  status: 403;
};

type ValidationErrorResponse = {
  message: string;
  errors: Record<string, string[]>;
};

type NotFoundResponse = {
  message: string;
  status: 404;
};

type ThrottleRequestsResponse = {
  message: string;
  status: 429;
};

type ServerErrorResponse = {
  message: string;
  status: 500;
};

type StatusResponse<T> = SuccessResponse<T> | ErrorResponse;

export type {
  ValidationErrorResponse,
  StatusResponse,
  ErrorResponse,
  SuccessResponse,
  AuthenticationResponse,
  AuthorizationResponse,
  NotFoundResponse,
  ThrottleRequestsResponse,
  ServerErrorResponse,
};
