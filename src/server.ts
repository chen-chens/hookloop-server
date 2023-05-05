import mongoose from "mongoose";

import app from "./app";

// Connect mongoDB
mongoose
  .connect(process.env.MONGO_DB_URI!)
  .then(() => {
    console.log("MongoDB is running!");
    app.listen(process.env.PORT!, () => {
      console.log("Server is running again!");
    });
  })
  .catch((error) => {
    console.log("MongoDB can't connect!", error);
  });

// DISCUSS:node.js 內建紀錄死機 error 寫法選擇
// const exitHandler = () => {
//   if (server) {
//     server.close(() => {
//       logger.info('Server closed');
//       process.exit(1);
//     });
//   } else {
//     process.exit(1);
//   }
// };

// const unexpectedErrorHandler = (error) => {
//   logger.error(error);
//   exitHandler();
// };

// process.on('uncaughtException', unexpectedErrorHandler);
// process.on('unhandledRejection', unexpectedErrorHandler);

process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("unhandledRejection:", promise, "reason:", reason);
});
