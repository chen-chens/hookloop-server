import { Request } from "express";

interface IDeleteUserFromWorkspaceRequest extends Request {
  body: {
    workspaceId: string;
    memberId: string;
  };
}
export default IDeleteUserFromWorkspaceRequest;
