function fileTypeFromBuffer(_buf) {
  return Promise.resolve({ mime: 'image/png' });
}

module.exports = { fileTypeFromBuffer };
