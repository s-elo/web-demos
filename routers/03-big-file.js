const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const router = express.Router();

const UPLOAD_DIR = path.resolve(__dirname, "..", "upload");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

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

router.get("/merge", async (req, res) => {
  const { fileName, size } = req.query;

  const filePath = path.resolve(UPLOAD_DIR, `${fileName}/${fileName}`);

  try {
    await mergeFileChunks(filePath, fileName, Number(size));
  } catch (err) {
    return res.send({
      done: false,
    });
  }

  return res.send({
    done: true,
  });
});

module.exports = router;
