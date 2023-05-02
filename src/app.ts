import cors from "cors";
import dotenv from "dotenv";
import express from "express";

// import corsOptions from "./config/corsOptions";
import router from "./routes";

dotenv.config();

const app = express();

app.use(cors()); // Set CORS with default options
app.use(express.json());
app.use(router); // Set router

export default app;
