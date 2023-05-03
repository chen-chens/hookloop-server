import { Request, Response } from "express";

const login = async (req: Request, res: Response) => {
  console.log(req, res);
  // (1) check email, password
  // (2) check if user exist by email
  // (3) send token: 後端 塞 cookie ?
};

const forgetPassword = async (req: Request, res: Response) => {
  console.log(req, res);
  // (1) 寄出通知信，信內容包含點擊前往重設密碼的按鈕
  // (2) 設定轉址網頁 失效時間
};

const verifyPassword = async (req: Request, res: Response) => {
  console.log(req, res);
  // 驗證：使用者輸入的驗證碼？ 這裡的 Password 是 驗證碼 嗎？
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
