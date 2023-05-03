import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: [`http://localhost:${process.env.PORT}`, "https://hookloop-client.onrender.com/"],
};

export default corsOptions;
