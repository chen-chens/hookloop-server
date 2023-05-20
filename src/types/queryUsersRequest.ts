import { Request } from "express";

interface IQueryUsersRequest extends Request {
  body: {
    email?: string;
    isArchived?: boolean;
  };
}
export default IQueryUsersRequest;
