import ApiStatus from "./apiStatus";
import StatusCode from "./statusCode";

// DISCUSS: the structure of custom error&檔案名稱要有I嗎?
interface CustomErrorInterface extends Error {
  statusCode: StatusCode;
  status: ApiStatus;
  isOperational: boolean;
}

export default CustomErrorInterface;
