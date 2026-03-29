import { filesApi } from '@/api/filesApi';
import { studentCheatLogsApi } from '@/api/studentCheatLogsApi';
import { store } from '@/redux/store';
import { sanitizeMime } from '@/lib/videoBuffer';

/** Minimum interval (ms) between two consecutive uploads of the SAME type. */
const UPLOAD_COOLDOWN_MS = 5_000;

let lastVideoUploadTime = 0;

/**
 * Upload a video blob (short evidence clip). Uses the same folder convention as image snapshots
 * and registers the resulting URL in the student cheat log (stored in CapturedImageUrl field
 * for backend compatibility).
 */
export async function uploadCheatVideo(
  blob: Blob,
  status: string,
  studentCode = 'unknown',
  classSubject = 'unknown',
  studentExamId = ''
): Promise<string | null> {
  const now = Date.now();
  if (now - lastVideoUploadTime < UPLOAD_COOLDOWN_MS) return null;
  lastVideoUploadTime = now;

  if (!blob || blob.size === 0) return null;

  const fileName = `cheat_${status}_${now}.webm`;
  const folderPath = `cheating-evidence/${studentCode}/${classSubject}`;

  return uploadAndLog(
    blob,
    fileName,
    sanitizeMime(blob.type),
    folderPath,
    status,
    studentExamId
  );
}

// ── Shared internals ────────────────────────────────────────────────────────

async function uploadAndLog(
  blob: Blob,
  fileName: string,
  fileType: string,
  folderPath: string,
  status: string,
  studentExamId: string
): Promise<string | null> {
  try {
    const file = new File([blob], fileName, { type: fileType });
    const uploadFile = filesApi.endpoints.uploadFile.initiate;
    // @ts-ignore: store is typed for RTK
    const result = await store
      .dispatch(uploadFile({ file, folder: folderPath }))
      .unwrap();
    const url: string | null = result?.fileUrl || null;

    if (url && studentExamId) {
      try {
        const createLog =
          studentCheatLogsApi.endpoints.createStudentCheatLog.initiate;
        // @ts-ignore: store is typed for RTK
        await store
          .dispatch(
            createLog({ studentExamId, status, capturedImageUrl: url })
          )
          .unwrap();
      } catch (logErr) {
        console.error('Failed to register cheat log:', logErr);
      }
    }

    return url;
  } catch (err) {
    console.error('Cheat evidence upload error:', err);
    return null;
  }
}
