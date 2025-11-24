import * as FileSystem from "expo-file-system";

const DEFAULT_MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB (default for token images)
export const AVATAR_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (for user avatars)
export const BANNER_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (for banners)
const ALLOWED_FORMATS = ["png", "jpg", "jpeg"];

export interface ImageValidationError {
  message: string;
  type: "size" | "format" | "unknown";
}

export interface ValidateImageFileOptions {
  maxSizeBytes?: number;
}

/**
 * Validates image file size and format
 * @param uri - Image URI from ImagePicker
 * @param options - Optional validation options (maxSizeBytes)
 * @returns Promise that resolves to error message if validation fails, or null if valid
 */
export async function validateImageFile(
  uri: string,
  options?: ValidateImageFileOptions
): Promise<ImageValidationError | null> {
  try {
    const maxSizeBytes = options?.maxSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;
    const maxSizeMB = maxSizeBytes / (1024 * 1024);
    
    // Check file size
    const size = await getFileSize(uri);
    if (size > maxSizeBytes) {
      return {
        message: `Image size exceeds ${maxSizeMB} MB limit. Current size: ${(size / (1024 * 1024)).toFixed(2)} MB`,
        type: "size",
      };
    }

    // Check file format
    const format = await getImageFormat(uri);
    const formatLower = format.toLowerCase();
    if (!ALLOWED_FORMATS.includes(formatLower)) {
      return {
        message: `Image must be in PNG or JPEG format. Current format: ${format.toUpperCase()}`,
        type: "format",
      };
    }

    return null; // Validation passed
  } catch (error) {
    return {
      message: `Failed to validate image: ${error instanceof Error ? error.message : "Unknown error"}`,
      type: "unknown",
    };
  }
}

/**
 * Gets the file size in bytes
 */
async function getFileSize(uri: string): Promise<number> {
  try {
    if (uri.startsWith("file://") || uri.startsWith("/")) {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) {
        return 0;
      }
      return info.size || 0;
    }

    const blob = await fetch(uri).then((r) => r.blob());
    return blob.size;
  } catch {
    return 0;
  }
}

/**
 * Gets the image format from URI or blob
 */
async function getImageFormat(uri: string): Promise<string> {
  try {
    // First, check MIME type from blob (most reliable)
    const blob = await fetch(uri).then((r) => r.blob());
    const mimeType = blob.type.toLowerCase();
    
    if (mimeType.includes("png")) return "png";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
    if (mimeType.includes("gif")) return "gif";
    if (mimeType.includes("webp")) return "webp";

    // Fallback: Try to get format from URI extension
    const uriLower = uri.toLowerCase();
    if (uriLower.includes(".png")) return "png";
    if (uriLower.includes(".jpg") || uriLower.includes(".jpeg")) return "jpg";
    if (uriLower.includes(".gif")) return "gif";
    if (uriLower.includes(".webp")) return "webp";

    // If MIME type is empty or generic, check file signature (magic bytes)
    // PNG files start with: 89 50 4E 47 0D 0A 1A 0A
    if (blob.size > 8) {
      const arrayBuffer = await blob.slice(0, 8).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // PNG signature: 89 50 4E 47 0D 0A 1A 0A
      if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
          bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A) {
        return "png";
      }
      
      // JPEG signature: FF D8 FF
      if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
        return "jpg";
      }
      
      // GIF signature: 47 49 46 38 (GIF8)
      if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
        return "gif";
      }
    }

    // Default to unknown
    return "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Converts image URI to File object, preserving original format
 * @param uri - Image URI
 * @param fileName - Desired file name (will preserve or add appropriate extension)
 * @returns File object
 */
export async function uriToFile(uri: string, fileName: string = "image.png"): Promise<File> {
  const response = await fetch(uri);
  const blob = await response.blob();
  
  // Detect format from blob MIME type
  const mimeType = blob.type.toLowerCase();
  let extension = ".png";
  let finalMimeType = "image/png";
  
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
    extension = ".jpg";
    finalMimeType = "image/jpeg";
  } else if (mimeType.includes("png")) {
    extension = ".png";
    finalMimeType = "image/png";
  } else {
    // Try to detect from filename or default to PNG
    const fileNameLower = fileName.toLowerCase();
    if (fileNameLower.includes(".jpg") || fileNameLower.includes(".jpeg")) {
      extension = ".jpg";
      finalMimeType = "image/jpeg";
    }
  }
  
  // Ensure filename has correct extension
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const finalFileName = `${baseName}${extension}`;
  
  return new File([blob], finalFileName, { type: finalMimeType });
}

