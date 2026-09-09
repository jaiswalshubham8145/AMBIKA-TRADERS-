import { supabase } from "@/lib/supabase";

const BUCKET = "product-images";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadError {
  message: string;
}

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateFilePath(file: File, slug?: string): string {
  const timestamp = Date.now();
  const ext = file.name.split(".").pop() || "jpg";
  const base = slug ? sanitizeFileName(slug) : sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
  return `${timestamp}-${base}.${ext}`;
}

export function validateFile(file: File): UploadError | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      message: `Invalid file type "${file.type}". Accepted: JPEG, PNG, WEBP, AVIF.`,
    };
  }
  if (file.size > MAX_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      message: `File is ${sizeMB}MB. Maximum allowed is 5MB.`,
    };
  }
  return null;
}

export function fileToCompressedDataUrl(
  file: File,
  maxWidth = 1000,
  quality = 0.85,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadProductImage(
  file: File,
  slug?: string,
  onProgress?: (progress: number) => void,
): Promise<UploadResult> {
  const validationError = validateFile(file);
  if (validationError) {
    throw new Error(validationError.message);
  }

  const path = generateFilePath(file, slug);

  onProgress?.(15);

  try {
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (uploadError) {
      console.warn("Supabase storage upload error, falling back to optimized inline data URL:", uploadError.message);
      onProgress?.(50);
      const dataUrl = await fileToCompressedDataUrl(file);
      onProgress?.(100);
      return {
        url: dataUrl,
        path: "inline-data",
      };
    }

    onProgress?.(70);

    // Try to create a long-lived signed URL (10 years) so it displays regardless of bucket privacy
    let finalUrl = "";
    try {
      const { data: signedData } = await supabase.storage.from(BUCKET).createSignedUrl(path, 315360000);
      if (signedData?.signedUrl) {
        finalUrl = signedData.signedUrl;
      }
    } catch (e) {
      console.warn("Could not generate signed URL:", e);
    }

    if (!finalUrl) {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      finalUrl = urlData?.publicUrl || "";
    }

    if (!finalUrl) {
      throw new Error("Failed to get public URL for uploaded image.");
    }

    onProgress?.(100);

    return {
      url: finalUrl,
      path,
    };
  } catch (err) {
    console.warn("Storage upload exception, falling back to optimized inline data URL:", err);
    onProgress?.(50);
    const dataUrl = await fileToCompressedDataUrl(file);
    onProgress?.(100);
    return {
      url: dataUrl,
      path: "inline-data",
    };
  }
}

export async function deleteProductImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
