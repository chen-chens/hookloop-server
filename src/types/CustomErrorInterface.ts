import ApiStatus from "./apiStatus";
import StatusCode from "./statusCode";

export interface DataType {
  [key: string]: any;
}

// DISCUSS: the structure of custom error&檔案名稱要有I嗎?
export interface CustomErrorInterface extends Error {
  statusCode: StatusCode;
  status: ApiStatus;
  data?: DataType;
  isOperational?: boolean;
}
