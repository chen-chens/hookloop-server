import { Router } from "express";

// import uploadSample from "./uploadSample";
import v1Routes from "./v1";

const router = Router();

router.get("/", (_req, res) => {
  console.log("Hello World!");
  res.cookie("WHERE_AM_I", "WHERE_AM_I", { expires: new Date(Date.now() + 24 * 2 * 60 * 60 * 1000) });
  res.send("Hello World!");
});
router.use("/api/v1", v1Routes);
// router.use("/api/uploadSample", uploadSample);

// FIXME: Remove this route after demo
// eslint-disable-next-line import/first, import/order
import { asyncWrapper } from "@/middlewares";

// eslint-disable-next-line import/first
import errorDemoCreateUser from "./errorDemoCreateUser";

router.post("/errorDemo", asyncWrapper(errorDemoCreateUser));
// FIXME: end

export default router;
