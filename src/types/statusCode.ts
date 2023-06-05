enum StatusCode {
  OK = 200,
  Created = 201,
  MOVED_PERMANENTLY = 301,
  TEMPORARY_REDIRECT = 307,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  REQUEST_TIMEOUT = 408,
  INTERNAL_SERVER_ERROR = 500,
  Service_Unavailable = 503,
}

export default StatusCode;
