const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const router = express.Router();

const UPLOAD_DIR = path.resolve(__dirname, "..", "demos/03-big-file");

router.post("/uploadFileChunks", async (req, res) => {
  const {
    fields: { hash, fileName },
    files: { chunk },
  } = req;

  const chunkDir = path.resolve(UPLOAD_DIR, fileName);

  // empty the dir, if no such dir,
  // create one for the file to store the chunks
  await fs.emptyDir(chunkDir);

  // move the temp chunk file to the file in chunkDir
  await fs.move(chunk.path, `${chunkDir}/${hash}`);

  return res.send({
    hash,
    done: true,
  });
});

router.get("/merge", (req, res) => {
  console.log(req.query.fileName);
  return res.send({
    done: true,
  });
});

module.exports = router;
