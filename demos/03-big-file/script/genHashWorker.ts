export default function () {
  self.onmessage = (event) => {
    const { fileChunks } = event.data;
    console.log(fileChunks);

    self.postMessage({ woker: true });
  };
}
