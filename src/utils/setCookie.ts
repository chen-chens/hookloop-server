import { Response } from "express";

import HOOKLOOP_TOKEN from "@/config/const";

const setCookie = (res: Response, token: string) => {
  res.cookie(HOOKLOOP_TOKEN, token, {
    expires: new Date(Date.now() + 24 * 2 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    domain: ".localhost, .onrender.com", // accept domain for setting cookie
    path: "/",
    sameSite: "none", // accept setting cookie for cross-origin
  });
};

export default setCookie;
