import { supabase } from "@/integrations/supabase/client";

export const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export function validateResume(file: File) {
  const byExtension = /\.(pdf|doc|docx)$/i.test(file.name);
  if (!ALLOWED_RESUME_TYPES.includes(file.type) && !byExtension) {
    return "Resume must be a PDF, DOC or DOCX file.";
  }
  if (file.size > MAX_RESUME_BYTES) return "Resume must be smaller than 5 MB.";
  return null;
}

/** Uploads a resume into the signed-in user's private folder and returns its storage path. */
export async function uploadResume(userId: string, file: File) {
  const extension = file.name.split(".").pop() ?? "pdf";
  const path = `${userId}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from("resumes").upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

export async function resumeDownloadUrl(path: string) {
  const { data, error } = await supabase.storage.from("resumes").createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}
