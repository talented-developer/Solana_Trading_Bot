// const { Buffer } = require('buffer');
// const { toBufferBE } = require('bigint-buffer');
//
// const bigEndianBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0xde, 0xad, 0xbe, 0xef]);
// console.log('Big Endian Buffer:', bigEndianBuffer);
// const bufferBE = toBufferBE(0xdeadbeefn, 8);
// console.log('Big Endian Buffer:', bufferBE);
const { execSync } = require('child_process');

function checkBigIntBuffer() {
  try {
    // Check if bigint-buffer is installed
    const result = execSync('yarn why bigint-buffer', { encoding: 'utf8' });
    console.log(result);

    // Check the version of bigint-buffer
    const versionResult = execSync('yarn list bigint-buffer', { encoding: 'utf8' });
    console.log('bigint-buffer version:', versionResult);

    // Here you can implement additional logic to check if bigint-buffer is functioning as expected
    console.log('bigint-buffer is correctly installed.');
  } catch (error) {
    console.error('Error checking bigint-buffer:', error.message);
  }
}

// Run the function
checkBigIntBuffer();