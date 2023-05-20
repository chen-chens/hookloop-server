import { Request } from "express";

import IRequestMembers from "./requestMembers";

interface IWorkspaceRequest extends Request {
  body: {
    name: string;
    members: IRequestMembers[];
    workspaceId?: string;
  };
}
export default IWorkspaceRequest;
