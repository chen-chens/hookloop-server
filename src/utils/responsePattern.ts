import { ApiStatus } from "@/types";

interface IDataType {
  [key: string]: any;
}
const responsePattern = (statusType: ApiStatus, message: string, data: IDataType) => {
  const pattern = {
    status: statusType,
    message,
    data,
  };

  return JSON.stringify(pattern);
};

export default responsePattern;
