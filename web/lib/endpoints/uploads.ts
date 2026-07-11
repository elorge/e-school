// web/lib/endpoints/uploads.ts
import { getToken } from '../api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function uploadFile(path: string, file: File): Promise<{ url: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData, // no Content-Type header — browser sets the multipart boundary itself
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export function uploadSchoolLogo(school: string, file: File) {
  return uploadFile(`/${school}/uploads/school-logo`, file);
}

export function uploadStudentPhoto(school: string, studentId: string, file: File) {
  return uploadFile(`/${school}/uploads/student-photo/${studentId}`, file);
}