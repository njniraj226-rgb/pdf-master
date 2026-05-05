const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Ye browser ko temporary cache ke bajaye project folder mein save karega
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};