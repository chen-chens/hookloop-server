import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: ["*"],
  credentials: true,
  preflightContinue: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;
