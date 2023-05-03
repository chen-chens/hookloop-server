// DISCUSS: 使用 asyncWrapper 包裹 async 函数，可以避免每個 async 函数都寫 try catch
// const asyncWrapper = (fn) => {
//   return  (req, res, nex) => {
//     try {
//       await fn(req, res, next);
//     } catch (err) {
//       next(err);
//     }
//   };
// };
import { NextFunction, Request, Response } from "express";

const asyncWrapper = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: Error) => next(err));
  };
};

export default asyncWrapper;
