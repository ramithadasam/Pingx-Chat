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
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: optionalEnv("JWT_EXPIRES_IN", "30d"),

  cloudinaryCloudName: requireEnv("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: requireEnv("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: requireEnv("CLOUDINARY_API_SECRET"),

  corsOrigin: optionalEnv("CORS_ORIGIN", "*"),
};
