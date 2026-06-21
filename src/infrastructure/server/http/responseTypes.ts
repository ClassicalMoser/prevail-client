/** Client-side error result. `statusCode` comes from the HTTP response. */
interface ErrorResponse {
  message: string;
  statusCode: number;
}

/** Client-side success result for routes that return 200 OK with a body. */
interface SuccessResponse200<T> {
  data: T;
  statusCode: 200;
}

/** Client-side success result for routes that return 201 Created with a body. */
interface SuccessResponse201<T> {
  data: T;
  statusCode: 201;
}

type Response200<T> = ErrorResponse | SuccessResponse200<T>;
type Response201<T> = ErrorResponse | SuccessResponse201<T>;

type GetResponse<T> = Response200<T>;
type PutResponse<T> = Response200<T>;
type PatchResponse<T> = Response200<T>;
type PostResponse<T> = Response200<T>;
type CreatedPostResponse<T> = Response201<T>;
type MediaPostResponse<T> = Response200<T>;

export type {
  CreatedPostResponse,
  ErrorResponse,
  GetResponse,
  MediaPostResponse,
  PatchResponse,
  PostResponse,
  PutResponse,
  Response200,
  Response201,
  SuccessResponse200,
  SuccessResponse201,
};
