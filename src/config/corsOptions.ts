import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: ["http://localhost:3000", "https://hookloop-client.onrender.com", "https://ccore.newebpay.com"],
  credentials: true,
  preflightContinue: true,
};

export default corsOptions;
