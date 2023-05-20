import ApiStatus from "./apiStatus";
import StatusCode from "./statusCode";

export interface IDataType {
  [key: string]: any;
}
export interface IErrorData {
  field: string;
  error: string;
}
export interface ICustomError extends Error {
  statusCode: StatusCode;
  status: ApiStatus;
  data?: IDataType;
  isOperational?: boolean;
}
