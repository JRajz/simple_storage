const fs = require('fs');
const crypto = require('crypto');

/**
 * Generates an MD5 hash key for the given file asynchronously.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<string>} - A promise that resolves with the MD5 hash key.
 */
async function generateHashKey(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (error) => reject(error));
  });
}

module.exports = { generateHashKey };
