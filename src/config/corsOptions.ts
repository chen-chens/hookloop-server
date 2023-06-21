import { CorsOptions } from "cors";
import dotenv from "dotenv";

dotenv.config();
const corsOptions: CorsOptions = {
  origin: [
    process.env.FRONT_LOCAL_URL!,
    process.env.FRONT_REMOTE_URL!,
    process.env.PAY_TEST_URL!,

    // admin
    process.env.ADMIN_LOCAL_URL!,
    process.env.ADMIN_REMOTE_URL!,
  ],
  credentials: true,
  preflightContinue: true,
};

export default corsOptions;
