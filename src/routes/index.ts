import { Router } from "express";

import v1Routes from "./v1";

const router = Router();

router.get("/", (_req, res) => {
  console.log("Hello World!");
  res.send("Hello World!");
});
router.use("/api/v1", v1Routes);

export default router;
