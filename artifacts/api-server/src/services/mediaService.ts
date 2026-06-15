import { uploadBuffer, type UploadResult } from "../lib/cloudinary";
import { AppError } from "../middleware/errorHandler";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

export interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export async function uploadChatMedia(file: UploadedFile, folder: string): Promise<UploadResult> {
  validateFile(file);
  return uploadBuffer(file.buffer, { folder, mimeType: file.mimetype });
}

export async function uploadAvatar(file: UploadedFile, folder: string): Promise<UploadResult> {
  if (!file.mimetype.startsWith("image/")) {
    throw new AppError(400, "invalid_file_type", "Avatar must be an image");
  }
  validateFile(file);
  return uploadBuffer(file.buffer, { folder, mimeType: file.mimetype });
}

function validateFile(file: UploadedFile): void {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new AppError(400, "file_too_large", "File must be 10MB or smaller");
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new AppError(400, "unsupported_file_type", "Unsupported file type");
  }
}
