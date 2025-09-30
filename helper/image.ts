import { fileTypeFromBuffer } from "file-type";

export async function validateImageBuffer(buf: Buffer) {
    // Validate that a buffer really contains an image file.
    // check that buffer exists and isn't empty
    if (!buf?.length) throw new Error("Empty file");

    // Detect real file type from the bytes
    const detected = await fileTypeFromBuffer(buf);

    // Check if the file is an image
    if (!detected || !detected.mime.startsWith("image/")) {
        throw new Error("Invalid image file");
    }

    return detected; // { ext: 'png', mime: 'image/png' }
}