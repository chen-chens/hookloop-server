import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: ["http://localhost:3000", "https://hookloop-client.onrender.com"],
  credentials: true,
  preflightContinue: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;
