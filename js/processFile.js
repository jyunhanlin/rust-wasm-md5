export const processFile = ({ file, process, processDone }) => {
  const fileReader = new FileReader();
  const chunkSize = 1048576; // 1048576 = 1MB
  let chunks = Math.ceil(file.size / chunkSize);
  let currentChunk = 0;

  return new Promise((resolve) => {
    fileReader.onload = function (e) {
      process(e.target.result);
      currentChunk++;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        const t1 = window.performance.now();
        processDone(t1 - t0, resolve);
      }
    };

    function loadNext() {
      const start = currentChunk * chunkSize,
        end = start + chunkSize >= file.size ? file.size : start + chunkSize;

      fileReader.readAsArrayBuffer(file.slice(start, end));
    }
    const t0 = window.performance.now();
    loadNext();
  });
};
