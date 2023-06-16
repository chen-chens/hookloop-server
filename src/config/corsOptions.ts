import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: [
    "http://localhost:3000",
    "https://hookloop-client.onrender.com",
    // admin
    "http://localhost:5173",
    "https://hookloop-admin.onrender.com",
  ],
  credentials: true,
  preflightContinue: true,
};

export default corsOptions;
