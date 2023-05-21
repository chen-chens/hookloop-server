import { ApiStatus, IDataType } from "@/types";

const responsePattern = (statusType: ApiStatus, message: string, data: IDataType) => {
  const pattern = {
    status: statusType,
    message,
    data,
  };

  return pattern;
};

export default responsePattern;
