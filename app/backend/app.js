const Koa = require("koa");
const app = new Koa();
const port = process.env.BACKEND_PORT || 3000;

require("./startup/routes")(app);

app.listen(port, () => console.log(`Connected on port ${port}`));
