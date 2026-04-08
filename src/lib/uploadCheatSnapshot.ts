import { filesApi } from '@/api/filesApi';
import { studentCheatLogsApi } from '@/api/studentCheatLogsApi';
import { store } from '@/redux/store';
import { sanitizeMime } from '@/lib/videoBuffer';

/** Minimum interval (ms) between two consecutive uploads of the SAME type. */
const UPLOAD_COOLDOWN_MS = 5_000;

// Separate cooldowns — image upload does NOT block video upload
let lastImageUploadTime = 0;
let lastVideoUploadTime = 0;

/**
 * Capture the current video frame as a JPEG blob and upload it to S3 using filesApi (with JWT).
 * Returns the URL string from the server on success, or `null` when skipped (cooldown) or on failure.
 */
export async function uploadCheatSnapshot(
  video: HTMLVideoElement,
  status: string,
  studentCode = 'unknown',
  classSubject = 'unknown',
  studentExamId = ''
): Promise<string | null> {
  const now = Date.now();
  if (now - lastImageUploadTime < UPLOAD_COOLDOWN_MS) return null;
  lastImageUploadTime = now;

  const blob = await captureFrame(video);
  if (!blob) return null;

  const fileName = `cheat_${status}_${now}.jpg`;
  const folderPath = `cheating-evidence/${studentCode}/${classSubject}`;

  return uploadAndLog(blob, fileName, 'image/jpeg', folderPath, status, studentExamId);
}

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

/** Draw the current video frame onto an off-screen canvas and export as JPEG. */
function captureFrame(video: HTMLVideoElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!video.videoWidth || !video.videoHeight) {
      resolve(null);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }

    ctx.drawImage(video, 0, 0);
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.8);
  });
}