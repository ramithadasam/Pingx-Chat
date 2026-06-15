function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required but was not provided.`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  nodeEnv: optionalEnv("NODE_ENV", "development"),
  port: parseInt(optionalEnv("PORT", "8080"), 10),

  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: optionalEnv("JWT_EXPIRES_IN", "30d"),

  // Cloudinary is optional — media upload endpoints return 503 when not configured
  cloudinaryCloudName: process.env["CLOUDINARY_CLOUD_NAME"] ?? "",
  cloudinaryApiKey: process.env["CLOUDINARY_API_KEY"] ?? "",
  cloudinaryApiSecret: process.env["CLOUDINARY_API_SECRET"] ?? "",
  cloudinaryEnabled: !!(
    process.env["CLOUDINARY_CLOUD_NAME"] &&
    process.env["CLOUDINARY_API_KEY"] &&
    process.env["CLOUDINARY_API_SECRET"]
  ),

  corsOrigin: optionalEnv("CORS_ORIGIN", "*"),
};
