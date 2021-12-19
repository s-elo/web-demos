const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const open = require("open");
// handle formdata
const formidableMiddleware = require("express-formidable");

const demo = express();
const port = 3500;
const [projectName] = process.argv.slice(2);

const domain = `http://localhost:${port}/${
  projectName ? projectName : "timer"
}`;

// handle formdata and post method
demo.use(formidableMiddleware());

demo.use("/demos", express.static(__dirname + "/demos"));
demo.use("/dist", express.static(__dirname + "/dist"));

// Cross-Origin Resource Sharing
demo.all("*", (_, res, next) => {
  res.header("Access-Control-Allow-Origin", `*`);
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE, PUT");

  next();
});

const projects = ["timer", "quiz-app", "big-file", "food-menu", "notes-app", "todos"];
const routerDir = path.resolve(__dirname, ".", "routers");

projects.forEach((project, index) => {
  // eg: 03-big-file
  const ProjectDirName = `${
    index < 9 ? `0${index + 1}` : index + 1
  }-${project}`;

  // get the html files
  demo.get(`/${project}`, (_, res) => {
    const html = fs.readFileSync(
      `./demos/${ProjectDirName}/${project}.html`,
      "utf8"
    );
    return res.send(String(html));
  });

  // use the routers
  const routerFileName = `${routerDir}/${ProjectDirName}.js`;

  // if the project uses the server
  if (fs.existsSync(routerFileName)) {
    const router = require(routerFileName);
    demo.use(`/${project}`, router);
  }
});

demo.get("/data", (_, res) => {
  return res.send({ data: "get it" });
});

demo.listen(port, () => console.log(`Listening on port ${port}`));

// ts compile watcher
exec("tsc -w");

open(domain, "chrome");
