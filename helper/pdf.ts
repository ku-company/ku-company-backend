import { fileTypeFromBuffer } from "file-type";

export async function validatePdfBuffer(buf: Buffer) {
  if (!buf?.length) throw new Error("Empty file");

  const detected = await fileTypeFromBuffer(buf);

  if (!detected || detected.mime !== "application/pdf") {
    throw new Error("Invalid or corrupted PDF file");
  }

  return detected;
}
    // { ext: 'pdf', mime: 'application/pdf' }