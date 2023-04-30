import { Request, Response } from "express";

const login = async (req: Request, res: Response) => {
  console.log(req, res);
  // (1) check email, password
  // (2) check if user exist by email
  // (3) send token
};

const forgetPassword = async (req: Request, res: Response) => {
  console.log(req, res);
};

const verifyPassword = async (req: Request, res: Response) => {
  console.log(req, res);
};

const verifyEmail = async (req: Request, res: Response) => {
  console.log(req, res);
};

export default {
  login,
  forgetPassword,
  verifyPassword,
  verifyEmail,
};
