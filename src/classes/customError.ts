import { ApiResults, ApiStatus, CustomErrorInterface, StatusCode } from "../types";
// DISCUSS: classes 資料夾放置位置
// 這裡的custom error是用來包裝原本的error，並且加上一些自己的屬性
// 不需傳入參數：status, isOperational
class CustomError extends Error implements CustomErrorInterface {
  statusCode: StatusCode;

  status: ApiStatus;

  isOperational: boolean;

  constructor(
    statusCode: StatusCode,
    message: ApiResults,
    status: ApiStatus = ApiStatus.FAIL,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
    this.isOperational = isOperational;
  }
}

export default CustomError;
