import { md5 as hash_wasm_md5 } from 'hash-wasm';
import MD5 from 'md5.js';
import SparkMD5 from 'spark-md5';
import { Buffer } from 'safe-buffer';

import { processFile } from './processFile';

const init = async () => {
  let rustApp;
  let fileBuffer;

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
    fileBuffer = Buffer.from(fileReader.result);
  };

  const calcMd5WithMd5Wasm = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const t0 = window.performance.now();
        const md5Wasm = rustApp.md5(fileBuffer);
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
        const md5Wasm = rustApp.ya_md5(fileBuffer);
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
    const md5Wasm = await hash_wasm_md5(fileBuffer);
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
      processDone: (delta, resolve) => {
        md5.end();
        const md5Web = Buffer.from(md5.read()).toString('hex');
        document.getElementById('result-md5').innerText = delta;
        document.getElementById('checksum-md5').innerText = md5Web;
        console.log('md5', { delta, md5: md5Web });
        resolve({ delta, md5: md5Web });
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
      processDone: (delta, resolve) => {
        const md5Web = Buffer.from(md5.end(true), 'binary').toString('hex');
        md5.destroy();
        document.getElementById('result-spark-md5').innerText = delta;
        document.getElementById('checksum-spark-md5').innerText = md5Web;
        console.log('spark-md5', { delta, md5: md5Web });
        resolve({ delta, md5: md5Web });
      },
    });
  };

  const cleanResult = () => {
    document.getElementById('result-rust-md5-wasm').innerText = '';
    document.getElementById('checksum-rust-md5-wasm').innerText = '';
    document.getElementById('result-rust-crypto-wasm').innerText = '';
    document.getElementById('checksum-rust-crypto-wasm').innerText = '';
    document.getElementById('result-hash-wasm').innerText = '';
    document.getElementById('checksum-hash-wasm').innerText = '';
    document.getElementById('result-md5').innerText = '';
    document.getElementById('checksum-md5').innerText = '';
    document.getElementById('result-spark-md5').innerText = '';
    document.getElementById('checksum-spark-md5').innerText = '';
  };

  document.getElementById('run-all').addEventListener('click', async function () {
    cleanResult();
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

  document.getElementById('show-bundle-size').addEventListener('click', () => {
    const bundleSizeEls = document.getElementsByClassName('bundle-size');
    for (let i = 0; i < bundleSizeEls.length; i++) {
      const el = bundleSizeEls[i];
      el.classList.toggle('is-hidden');
    }
  });
};

document.addEventListener('DOMContentLoaded', init);
