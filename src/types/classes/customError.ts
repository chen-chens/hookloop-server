import ApiResults from "../apiResults";
import ApiStatus from "../apiStatus";
import ICustomError from "../customError";
import StatusCode from "../statusCode";
// DISCUSS: classes 資料夾放置位置
// 這裡的custom error是用來包裝原本的error，並且加上一些自己的屬性
// 不需傳入參數：status, isOperational
class CustomError extends Error implements ICustomError {
  statusCode: StatusCode;

  status: ApiStatus;

  message: ApiResults;

  isOperational: boolean;

  stack?: string;

  constructor(
    statuscode: StatusCode,
    message: ApiResults,
    stack?: string,
    status: ApiStatus = ApiStatus.ERROR,
    isOperational: boolean = true,
  ) {
    super();
    this.statusCode = statuscode;
    this.message = message;
    this.stack = stack;
    this.status = status;
    this.isOperational = isOperational;
  }
}

export default CustomError;
