import { NextFunction, Request, Response } from "express";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

export default {
  createOrder,
};
