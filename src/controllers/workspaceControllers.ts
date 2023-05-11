import { NextFunction, Request, Response } from "express";

const getWorkspacesById = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

const createWorkspace = async (req: Request, res: Response) => {
  res.json(req.body.user);
};

const updateWorkspaceById = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

const closeWorkspaceById = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

const getAvailableUsersByWorkspaceId = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

const addPinnedByWorkspaceId = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

const deleteUserFromWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

const getWorkspacesByUserId = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

export default {
  getWorkspacesById,
  createWorkspace,
  updateWorkspaceById,
  closeWorkspaceById,
  getAvailableUsersByWorkspaceId,
  addPinnedByWorkspaceId,
  deleteUserFromWorkspace,
  getWorkspacesByUserId,
};
