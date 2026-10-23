import fs from 'fs/promises';
import pdfParse from 'pdf-parse';

export async function extractTextFromPdf(filePath) {
  const buffer = await fs.readFile(filePath);
  const result = await pdfParse(buffer);
  return result.text.trim();
}

export async function deleteUploadedFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch {
    // non-fatal
  }
}
