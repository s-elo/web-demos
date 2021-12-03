const express = require("express");
const axios = require("axios");
const fs = require("fs");
const { exec } = require("child_process");
const open = require("open");

const demo = express();
const port = 3500;
const [projectName] = process.argv.slice(2);

const domain = `http://localhost:${port}/${
  projectName ? projectName : "timer"
}`;

demo.use("/demos", express.static(__dirname + "/demos"));
demo.use("/dist", express.static(__dirname + "/dist"));

// Cross-Origin Resource Sharing
demo.all("*", (_, res, next) => {
  res.header("Access-Control-Allow-Origin", `*`);
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE, PUT");

  next();
});

const projects = ["timer", 'quiz-app', 'big-file'];

projects.forEach((project, index) => {
  demo.get(`/${project}`, (_, res) => {
    const html = fs.readFileSync(
      `./demos/${
        index < 9 ? `0${index + 1}` : index + 1
      }-${project}/${project}.html`,
      "utf8"
    );
    return res.send(String(html));
  });
});

demo.get("/data", (_, res) => {
  return res.send({ data: "get it" });
});

demo.listen(port, () =>
  console.log(`Listening on port ${port}`)
);

// ts compile watcher
exec("tsc -w");

open(domain, "chrome");
