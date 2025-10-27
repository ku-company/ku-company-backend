function fileTypeFromBuffer(_buf) {
  // For tests, default to PDF so validatePdfBuffer passes.
  return Promise.resolve({ mime: 'application/pdf' });
}

module.exports = { fileTypeFromBuffer };
