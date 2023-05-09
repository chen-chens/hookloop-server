import { NextFunction, Request, Response } from "express";

const getAllWorkspaces = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

const createWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

const updateWorkspaceById = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

const archiveWorkspaceById = async (req: Request, res: Response, next: NextFunction) => {
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
  getAllWorkspaces,
  createWorkspace,
  updateWorkspaceById,
  archiveWorkspaceById,
  getAvailableUsersByWorkspaceId,
  addPinnedByWorkspaceId,
  deleteUserFromWorkspace,
  getWorkspacesByUserId,
};
