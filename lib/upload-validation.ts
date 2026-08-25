// Shared file-upload constraints, reused by profile photos, module
// PDFs/slides, and any future upload form - one place to tune limits.

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB
export const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10MB - PDFs/slide decks
export const PDF_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
};
export const SLIDES_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
};

export function extFor(file: File, allowed: Record<string, string>): string | null {
  return allowed[file.type] ?? null;
}
