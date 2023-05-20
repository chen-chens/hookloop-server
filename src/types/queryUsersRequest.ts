import { Request } from "express";

interface IQueryUsersRequest extends Request {
  body: {
    email: string;
  };
}
export default IQueryUsersRequest;
