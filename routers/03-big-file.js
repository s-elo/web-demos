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

  const chunkDir = path.resolve(UPLOAD_DIR, `${fileName}-chunks`);

  try {
    // empty the dir, if no such dir,
    // create one for the file to store the chunks
    await fs.emptyDir(chunkDir);

    // move the temp chunk file to the file in chunkDir
    await fs.move(chunk.path, `${chunkDir}/${hash}`);
  } catch {
    return res.send({
      hash,
      done: false,
    });
  }

  return res.send({
    hash,
    done: true,
  });
});

router.get("/merge", async (req, res) => {
  const { fileName, size } = req.query;

  const filePath = path.resolve(UPLOAD_DIR, `${fileName}`);

  try {
    await mergeFileChunks(filePath, fileName, Number(size));
  } catch (err) {
    console.log(err);
    return res.send({
      done: false,
    });
  }

  return res.send({
    done: true,
  });
});

function sortChunks(chunks) {
  const getOrder = (ChunkName) => Number(ChunkName.split("-")[1]);

  chunks.sort((a, b) => getOrder(a) - getOrder(b));
}

async function mergeFileChunks(filePath, fileName, size) {
  const chunkDir = path.resolve(UPLOAD_DIR, `${fileName}-chunks`);

  // get all the chunk file names
  const chunkFileNames = await fs.readdir(chunkDir);

  sortChunks(chunkFileNames);

  const pipes = chunkFileNames.map((chunkName, index) => {
    // const size = fs.statSync(`${chunkDir}/${chunkName}`).size;

    const readStreamPath = path.resolve(chunkDir, chunkName);

    // create the write stream via a given postion
    const writeStream = fs.createWriteStream(filePath, {
      start: index * size,
      end: (index + 1) * size,
    });

    // each chunk has a pair of streams
    return pipeStream(readStreamPath, writeStream);
  });

  // readStream -> wirteStream
  await Promise.all(pipes);

  // remove all the chunks
  fs.rmdirSync(chunkDir);
}

// read the file in the filePath and write through the writeStream
// wirteStream is created via fs
function pipeStream(readStreamPath, writeStream) {
  return new Promise((res) => {
    const readStream = fs.createReadStream(readStreamPath);

    readStream.on("end", () => {
      // unlink the readStream
      fs.unlinkSync(readStreamPath);
      res();
    });

    readStream.on("error", (err) => {
      console.log(err);
    });

    readStream.pipe(writeStream);
  });
}

module.exports = router;
