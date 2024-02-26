module.exports = function (app) {
  // Error Handling
  app.on("error", (err) => {
    console.error("server error: ", err);
  });

  process.on("uncaughtException", (ex) => {
    console.error("uncaughtException: ", ex);
  });

  process.on("unhandledRejection", (ex) => {
    console.error("unhandledRejection: ", ex);
  });
};
