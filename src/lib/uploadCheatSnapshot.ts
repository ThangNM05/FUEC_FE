/** Minimum interval (ms) between two consecutive snapshot uploads. */
const UPLOAD_COOLDOWN_MS = 5_000

let lastUploadTime = 0

/**
 * Capture the current video frame as a JPEG blob and upload it to the
 * backend's `/Files/upload` endpoint which stores it in S3.
 *
 * Returns the URL string from the server on success, or `null` when
 * skipped (cooldown) or on failure.
 */
export async function uploadCheatSnapshot(
  video: HTMLVideoElement,
  status: string,
  studentCode: string = 'unknown',
  classSubject: string = 'unknown',
  studentExamId: string = ''
): Promise<string | null> {
  const now = Date.now()
  if (now - lastUploadTime < UPLOAD_COOLDOWN_MS) return null
  lastUploadTime = now

  const blob = await captureFrame(video)
  if (!blob) return null

  const fileName = `cheat_${status}_${now}.jpg`
  const formData = new FormData()
  formData.append('file', blob, fileName)

  const baseUrl = import.meta.env.VITE_API_URL ?? ''
  const folderPath = `cheating-evidence/${studentCode}/${classSubject}`

  try {
    const res = await fetch(`${baseUrl}/Files/upload?folder=${encodeURIComponent(folderPath)}`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      console.error('Cheat snapshot upload failed:', res.status)
      return null
    }

    const data = await res.json()
    const url = data?.url ?? data?.fileUrl ?? null

    // Register evidence in the backend
    if (url && studentExamId) {
      try {
        const token = localStorage.getItem('token') || '';
        await fetch(`${baseUrl}/v1/StudentExams/${studentExamId}/cheat-logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            status: status,
            capturedImageUrl: url
          })
        });
      } catch (logErr) {
        console.error('Failed to register cheat log:', logErr)
      }
    }

    return url
  } catch (err) {
    console.error('Cheat snapshot upload error:', err)
    return null
  }
}

/** Draw the current video frame onto an off-screen canvas and export as JPEG. */
function captureFrame(video: HTMLVideoElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      resolve(null)
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      resolve(null)
      return
    }

    ctx.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => resolve(blob),
      'image/jpeg',
      0.8,
    )
  })
}
