export default function () {
  const workerSelf = self as any;

  // importScripts no cross origin issue
  // in the import script, the global scope(window) will have the SparkMD5
  // thus the workerSelf scope also has
  // now we can use SparkMD5 to generate the hash in this worker
  workerSelf.importScripts(
    "https://cdn.bootcdn.net/ajax/libs/spark-md5/3.0.0/spark-md5.min.js"
  );

  workerSelf.onmessage = (event: MessageEvent<any>) => {
    const spark = new workerSelf.SparkMD5.ArrayBuffer();

    const { fileChunks } = event.data;

    // this count is used to record the number of chunks
    // that have been append to the SparkMD5(not generate hash yet)
    // since the SparkMD5 generates the hash based on all the chunks
    // then use SparkMD5.end() to get the hash of the whole file
    let count = 0;

    function loadNext(index: number) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(fileChunks[index].chunk);

      // after read the chunk
      reader.onload = (event) => {
        count++;

        spark.append(event.target?.result);

        // finished all the chunks
        if (count === fileChunks.length) {
          workerSelf.postMessage({
            hash: spark.end(),
          });

          workerSelf.close();
        } else {
          // recurse to next chunk
          loadNext(count);
        }
      };
    }

    loadNext(count);
  };
}
