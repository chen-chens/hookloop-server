import mongoose from "mongoose";

import app from "./app";

// Connect mongoDB
mongoose
  .connect(process.env.MONGO_DB_URL!)
  .then(() => {
    console.log("MongoDB is running!");
    app.listen(process.env.PORT!, () => {
      console.log("Server is running again!");
    });
  })
  .catch((error) => {
    console.log("MongoDB can't connect!", error);
  });
