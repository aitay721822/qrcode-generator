/**
 * Validate if a string is a valid base64 image string or data URI
 */
export function isValidBase64Image(str: string): boolean {
  if (!str || typeof str !== "string") {
    return false;
  }

  const trimmed = str.trim();

  // Check if it's a data URI
  if (trimmed.startsWith("data:image/")) {
    const match = trimmed.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!match) {
      return false;
    }
    const base64Part = match[2];
    return isValidBase64String(base64Part);
  }

  // Check if it's a pure base64 string
  return isValidBase64String(trimmed);
}

/**
 * Validate if a string is a valid base64 string
 */
function isValidBase64String(str: string): boolean {
  if (!str || str.length === 0) {
    return false;
  }

  // Base64 regex pattern
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(str)) {
    return false;
  }

  // Try to decode to verify it's valid
  try {
    // Check if length is valid for base64 (must be multiple of 4 after padding)
    return str.length % 4 === 0 || str.includes("=");
  } catch {
    return false;
  }
}

/**
 * Extract pure base64 string from data URI or return as-is
 */
export function extractBase64(str: string): string {
  const trimmed = str.trim();

  if (trimmed.startsWith("data:image/")) {
    const match = trimmed.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
    return match ? match[1] : trimmed;
  }

  return trimmed;
}

/**
 * Get MIME type from data URI or default to PNG
 */
export function getMimeType(str: string): string {
  const trimmed = str.trim();

  if (trimmed.startsWith("data:image/")) {
    const match = trimmed.match(/^data:image\/([a-zA-Z+]+);base64,/);
    if (match) {
      return `image/${match[1]}`;
    }
  }

  // Default to PNG if we can't detect the type
  return "image/png";
}

/**
 * Convert base64 string to data URI format
 */
export function toDataUri(str: string): string {
  const trimmed = str.trim();
  const mimeType = getMimeType(trimmed);
  const base64 = extractBase64(trimmed);

  return `data:${mimeType};base64,${base64}`;
}

/**
 * Get file size from base64 string in human-readable format
 */
export function getFileSize(base64: string): string {
  const base64Length = base64.length;
  // Base64 encodes every 3 bytes as 4 characters
  const sizeInBytes = (base64Length * 3) / 4;

  if (sizeInBytes < 1024) {
    return `${Math.round(sizeInBytes)} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
