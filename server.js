const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const { projectName } = yargs(hideBin(process.argv)).argv;

// handle formdata
const formidableMiddleware = require("express-formidable");

const demo = express();
const port = 3500;

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

const isDir = (path) => {
  const stat = fs.statSync(path);

  return stat.isDirectory();
};
const demoPath = path.resolve(__dirname, ".", "demos");
const projects = fs
  .readdirSync(path.resolve(__dirname, ".", "demos"))
  .filter((file) => isDir(path.resolve(`${demoPath}/${file}`)));

const routerDir = path.resolve(__dirname, ".", "routers");

projects.forEach((ProjectDirName, _) => {
  // eg: 03-big-file
  const projectName = ProjectDirName.slice(3);

  // get the html files
  demo.get(`/${projectName}`, (_, res) => {
    const html = fs.readFileSync(
      `./demos/${ProjectDirName}/${projectName}.html`,
      "utf8"
    );
    return res.send(String(html));
  });

  // use the routers
  const routerFileName = `${routerDir}/${ProjectDirName}.js`;

  // if the project uses the server
  if (fs.existsSync(routerFileName)) {
    const router = require(routerFileName);
    demo.use(`/${projectName}`, router);
  }
});

demo.get("/data", (_, res) => {
  return res.send({ data: "get it" });
});

demo.listen(port, () => console.log(`Listening on ${domain}`));

// ts compile watcher
exec("tsc -w");
