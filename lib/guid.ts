import { uuidv7 } from "uuidv7";

export type UuidVersion = "v4" | "v7";

export interface FormatOptions {
  hyphens: boolean;
  braces: boolean;
  uppercase: boolean;
  quotes: boolean;
  commas: boolean;
}

/**
 * Generate a single GUID v4 using browser's crypto API
 */
export function generateGuidV4(): string {
  return crypto.randomUUID();
}

/**
 * Generate a single GUID v7
 */
export function generateGuidV7(): string {
  return uuidv7();
}

/**
 * Generate a single GUID of the specified version
 * @param version The UUID version to generate (v4 or v7)
 */
export function generateGuid(version: UuidVersion = "v7"): string {
  return version === "v4" ? generateGuidV4() : generateGuidV7();
}

/**
 * Generate multiple GUIDs
 * @param count Number of GUIDs to generate
 * @param version The UUID version to generate (v4 or v7)
 */
export function generateMultipleGuids(
  count: number,
  version: UuidVersion = "v7",
): string[] {
  return Array.from({ length: count }, () => generateGuid(version));
}

/**
 * Generate similar GUIDs based on a reference GUID
 * This maintains the timestamp portion and generates new random portions
 * @param referenceGuid The reference GUID to base the timestamp on
 * @param count Number of GUIDs to generate
 * @param timeOffset Optional time offset in milliseconds to apply to the reference timestamp
 */
export function generateSimilarGuids(
  referenceGuid: string,
  count: number,
  timeOffset?: number,
): string[] {
  // Parse the reference GUID to extract timestamp portion
  // UUID v7 format: xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx
  // First 48 bits (12 hex chars) are timestamp
  const cleaned = referenceGuid.replace(/-/g, "");
  if (cleaned.length !== 32) {
    throw new Error("Invalid GUID format");
  }

  // Extract timestamp portion (first 12 hex chars) and convert to timestamp
  const timestampHex = cleaned.substring(0, 12);
  let timestamp = Number.parseInt(timestampHex, 16);

  // Apply time offset if provided
  if (timeOffset !== undefined && timeOffset !== 0) {
    timestamp += timeOffset;
  }

  // Convert back to hex (12 chars, padded with zeros)
  const offsetTimestampHex = timestamp.toString(16).padStart(12, "0");

  const guids: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate a new GUID v7 and replace its timestamp with the offset timestamp
    const newGuid = generateGuidV7().replace(/-/g, "");
    const similarGuid = offsetTimestampHex + newGuid.substring(12);

    // Reformat with hyphens
    const formatted = `${similarGuid.substring(0, 8)}-${similarGuid.substring(8, 12)}-${similarGuid.substring(12, 16)}-${similarGuid.substring(16, 20)}-${similarGuid.substring(20)}`;
    guids.push(formatted);
  }

  return guids;
}

/**
 * Format a GUID according to the specified options
 */
export function formatGuid(guid: string, options: FormatOptions): string {
  let formatted = guid;

  // Remove hyphens if needed
  if (!options.hyphens) {
    formatted = formatted.replace(/-/g, "");
  }

  // Apply uppercase
  if (options.uppercase) {
    formatted = formatted.toUpperCase();
  }

  // Apply braces
  if (options.braces) {
    formatted = `{${formatted}}`;
  }

  // Apply quotes
  if (options.quotes) {
    formatted = `"${formatted}"`;
  }

  // Apply commas
  if (options.commas) {
    formatted = `${formatted},`;
  }

  return formatted;
}

/**
 * Format multiple GUIDs
 */
export function formatMultipleGuids(
  guids: string[],
  options: FormatOptions,
): string[] {
  return guids.map((guid) => formatGuid(guid, options));
}

/**
 * Validate GUID format
 */
export function isValidGuid(guid: string): boolean {
  const guidRegex =
    /^[{]?[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}[}]?$/;
  return guidRegex.test(guid);
}
