import { Response } from "express";

import HOOKLOOP_TOKEN from "@/config/const";

const setCookie = (res: Response, token: string) => {
  // const domain = process.env.NODE_ENV === "production" ? process.env.FRONT_REMOTE_URL : ".localhost";
  res.cookie(HOOKLOOP_TOKEN, token, {
    expires: new Date(Date.now() + 24 * 2 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    // domain, // accept domain for setting cookie
    path: "/",
    sameSite: "none", // accept setting cookie for cross-origin
  });
};

export default setCookie;
