import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  mimeType: string;
  size: number;
}

/**
 * Uploads a file buffer to Cloudinary in the given folder.
 * `resourceType: "auto"` lets Cloudinary detect images vs. raw files
 * (e.g. PDFs, documents) sent as chat attachments.
 */
export async function uploadBuffer(
  buffer: Buffer,
  options: { folder: string; mimeType: string },
): Promise<UploadResult> {
  const result = await new Promise<{ secure_url: string; public_id: string; bytes: number }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: options.folder, resource_type: "auto" },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error("Cloudinary upload failed with no result"));
            return;
          }
          resolve(uploadResult as { secure_url: string; public_id: string; bytes: number });
        },
      );
      stream.end(buffer);
    },
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
    mimeType: options.mimeType,
    size: result.bytes,
  };
}

export async function deleteAsset(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch(() => {
    // Best-effort cleanup; ignore failures (e.g. asset already removed, or non-image resource type).
  });
}
