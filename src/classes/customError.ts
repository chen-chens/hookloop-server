import { ApiResults, ApiStatus, CustomErrorInterface, DataType, StatusCode } from "../types";

// DISCUSS: classes 資料夾放置位置?
// 這裡的custom error是用來包裝原本的error，並且加上一些自己的屬性

class CustomError extends Error implements CustomErrorInterface {
  statusCode: StatusCode;

  status: ApiStatus;

  data: DataType;

  isOperational: boolean;

  constructor(
    statusCode: StatusCode,
    message: ApiResults,
    data: DataType = {},
    status: ApiStatus = ApiStatus.FAIL,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.status = status;
    this.isOperational = isOperational;
  }
}

export default CustomError;
