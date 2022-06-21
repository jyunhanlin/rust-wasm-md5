import { md5 as hash_wasm_md5 } from 'hash-wasm';
import MD5 from 'md5.js';
import SparkMD5 from 'spark-md5';
import { Buffer } from 'safe-buffer';

const init = async () => {
  let rustApp;
  let base64;

  try {
    rustApp = await import('../pkg');
  } catch (e) {
    console.log(e);
  }
  console.log({ rustApp });

  const input = document.getElementById('upload');
  const fileReader = new FileReader();

  input.addEventListener('change', () => {
    fileReader.readAsArrayBuffer(input.files[0]);
    document.getElementById('file-name').innerText = input.files[0].name;
  });

  fileReader.onloadend = () => {
    base64 = Buffer.from(fileReader.result);
  };

  const calcMd5WithMd5Wasm = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const t0 = window.performance.now();
        const md5Wasm = rustApp.md5(base64);
        const t1 = window.performance.now();
        document.getElementById('result-rust-md5-wasm').innerText = t1 - t0;
        document.getElementById('checksum-rust-md5-wasm').innerText = md5Wasm;
        console.log('rust-md5-wasm', { delta: t1 - t0, md5: md5Wasm });
        resolve({ delta: t1 - t0, md5: md5Wasm });
      });
    });
  };

  const calcMd5WithCryptoWasm = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const t0 = window.performance.now();
        const md5Wasm = rustApp.ya_md5(base64);
        const t1 = window.performance.now();
        document.getElementById('result-rust-crypto-wasm').innerText = t1 - t0;
        document.getElementById('checksum-rust-crypto-wasm').innerText = md5Wasm;
        console.log('rust-crypto-wasm', { delta: t1 - t0, md5: md5Wasm });
        resolve({ delta: t1 - t0, md5: md5Wasm });
      });
    });
  };

  const calcMd5WithHashWasm = async () => {
    const t0 = window.performance.now();
    const md5Wasm = await hash_wasm_md5(base64);
    const t1 = window.performance.now();
    document.getElementById('result-hash-wasm').innerText = t1 - t0;
    document.getElementById('checksum-hash-wasm').innerText = md5Wasm;
    console.log('hash-wasm', { delta: t1 - t0, md5: md5Wasm });
    return { delta: t1 - t0, md5: md5Wasm };
  };

  const calcMd5WithNodeMd5 = () => {
    const md5 = new MD5();

    return processFile({
      file: input.files[0],
      process: (slice) => {
        md5.update(Buffer.from(slice));
      },
      processDone: (delta) => {
        md5.end();
        const md5Web = Buffer.from(md5.read()).toString('hex');
        document.getElementById('result-md5').innerText = delta;
        document.getElementById('checksum-md5').innerText = md5Web;
        console.log('spark-md5', { delta, md5: md5Web });
      },
    });
  };

  const calcMd5WithSparkMd5 = () => {
    const md5 = new SparkMD5.ArrayBuffer();
    return processFile({
      file: input.files[0],
      process: (slice) => {
        md5.append(slice);
      },

      processDone: (delta) => {
        const md5Web = Buffer.from(md5.end(true), 'binary').toString('hex');
        md5.destroy();
        document.getElementById('result-spark-md5').innerText = delta;
        document.getElementById('checksum-spark-md5').innerText = md5Web;
        console.log('spark-md5', { delta, md5: md5Web });
      },
    });
  };

  document.getElementById('run-all').addEventListener('click', async function () {
    this.classList.add('is-loading');
    this.setAttribute('disabled', 'disabled');
    try {
      await calcMd5WithMd5Wasm();
      await calcMd5WithCryptoWasm();
      await calcMd5WithHashWasm();
      await calcMd5WithNodeMd5();
      await calcMd5WithSparkMd5();
    } catch (e) {
      console.log(e);
    }
    this.classList.remove('is-loading');
    this.removeAttribute('disabled');
  });
};

document.addEventListener('DOMContentLoaded', init);

const processFile = ({ file, process, processDone }) => {
  const fileReader = new FileReader();
  const chunkSize = 32 * 1048576; // 1048576 = 1MB
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
        processDone(t1 - t0);
        resolve();
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
