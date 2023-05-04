import ApiStatus from "../types/apiStatus";

interface DataType {
  [key: string]: any;
}
const responsePattern = (statusType: ApiStatus, message: string, data: DataType) => {
  const pattern = {
    status: statusType,
    message,
    data,
  };

  return JSON.stringify(pattern);
};

export default responsePattern;
