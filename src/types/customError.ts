import ApiResults from "./apiResults";
import ApiStatus from "./apiStatus";
import { ICustomError, IDataType } from "./customErrorInterface";
import StatusCode from "./statusCode";

class CustomError extends Error implements ICustomError {
  statusCode: StatusCode;

  status: ApiStatus;

  data: IDataType;

  isOperational: boolean;

  constructor(
    statusCode: StatusCode,
    message: ApiResults,
    data: IDataType = {},
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
