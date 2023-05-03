import ApiResults from "./apiResults";
import ApiStatus from "./apiStatus";
import StatusCode from "./statusCode";

// DISCUSS: the structure of custom error&檔案名稱要有I嗎?
interface ICustomError extends Error {
  statusCode: StatusCode;
  status: ApiStatus;
  message: ApiResults;
  isOperational: boolean;
  stack?: string;
}

export default ICustomError;
