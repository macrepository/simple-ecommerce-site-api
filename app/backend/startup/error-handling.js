// Error Handler - It will catch by winston and print logs

module.exports = function (app) {
  app.on("error", (err) => {
    throw err;
  });

  process.on("unhandledRejection", (ex) => {
    throw ex;
  });
};
