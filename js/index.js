import { md5 } from 'hash-wasm';
import SparkMD5 from 'spark-md5';
import MD5 from 'md5.js';

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
    fileReader.readAsDataURL(input.files[0]);
  });

  fileReader.onloadend = () => {
    base64 = fileReader.result.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
  };

  const calcMd5WithMd5Wasm = () => {
    const t0 = window.performance.now();
    const md5Wasm = rustApp.digest(base64);
    const t1 = window.performance.now();
    console.log('rust-md5-wasm', { delta: t1 - t0, md5: md5Wasm });
  };

  const calcMd5WithCryptoWasm = () => {
    const t0 = window.performance.now();
    const md5Wasm = rustApp.md5(base64);
    const t1 = window.performance.now();
    console.log('rust-crypto-wasm', { delta: t1 - t0, md5: md5Wasm });
  };

  const calcMd5WithHashWasm = async () => {
    const t0 = window.performance.now();
    const md5Wasm = await md5(base64);
    const t1 = window.performance.now();
    console.log('hash-wasm', { delta: t1 - t0, md5: md5Wasm });
  };

  const calcMd5WithNodeMd5 = () => {
    const t0 = window.performance.now();
    const md5 = new MD5();
    const md5Web = md5.update(base64).digest('hex');
    const t1 = window.performance.now();
    console.log('md5', { delta: t1 - t0, md5: md5Web });
  };

  const calcMd5WithSparkMd5 = () => {
    const t0 = window.performance.now();
    const md5Web = SparkMD5.hash(base64);
    const t1 = window.performance.now();
    console.log('spark-md5', { delta: t1 - t0, md5: md5Web });
  };

  const runAll = async () => {
    calcMd5WithMd5Wasm();
    calcMd5WithCryptoWasm();
    await calcMd5WithHashWasm();
    calcMd5WithNodeMd5();
    calcMd5WithSparkMd5();
  };

  document.getElementById('run-all').addEventListener('click', runAll);

  document.getElementById('rust-md5-wasm').addEventListener('click', calcMd5WithMd5Wasm);

  document.getElementById('rust-crypto-wasm').addEventListener('click', calcMd5WithCryptoWasm);

  document.getElementById('hash-wasm').addEventListener('click', calcMd5WithHashWasm);

  document.getElementById('md5').addEventListener('click', calcMd5WithNodeMd5);

  document.getElementById('spark-md5').addEventListener('click', calcMd5WithSparkMd5);
};

document.addEventListener('DOMContentLoaded', init);
