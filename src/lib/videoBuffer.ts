// videoBuffer.ts — Episode-based recording
// Records from the moment suspicious behavior starts until the user returns to safe.
// Provides a clean, playable WebM file with proper headers and timestamps.

export interface EpisodeRecorder {
  /** Start recording (no-op if already recording) */
  start(): void;
  /** Stop recording and return the full clip */
  stop(): Promise<Blob | null>;
  /** Whether currently recording */
  readonly isRecording: boolean;
  /** Tear down everything */
  destroy(): void;
}

export function createEpisodeRecorder(stream: MediaStream): EpisodeRecorder | null {
  if (typeof window === 'undefined' || !('MediaRecorder' in window)) return null;
  if (!stream?.active) return null;

  const mimeType = negotiateMime();
  console.log('[EpisodeRecorder] Negotiated MIME:', mimeType);

  let recorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];
  let recording = false;
  let destroyed = false;

  // Safety: cap at 30s so a stuck episode doesn't eat memory
  let safetyTimer: ReturnType<typeof setTimeout> | null = null;
  const MAX_DURATION_MS = 30_000;

  const api: EpisodeRecorder = {
    start() {
      if (destroyed) {
        console.warn('[EpisodeRecorder] start() called after destroy — ignoring');
        return;
      }
      if (recording) {
        console.warn('[EpisodeRecorder] start() called while already recording — ignoring');
        return;
      }
      if (!stream.active) {
        console.warn('[EpisodeRecorder] start() called but stream is inactive — ignoring');
        return;
      }

      chunks = [];

      // Create a fresh MediaRecorder for this episode
      try {
        recorder = new MediaRecorder(stream, { mimeType });
      } catch (e1) {
        console.warn('[EpisodeRecorder] Primary MediaRecorder failed:', mimeType, e1);
        try {
          recorder = new MediaRecorder(stream);
        } catch (e2) {
          console.error('[EpisodeRecorder] Fallback MediaRecorder also failed:', e2);
          return;
        }
      }

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onerror = (ev) => {
        console.warn('[EpisodeRecorder] MediaRecorder error during episode:', ev);
        recording = false;
      };

      try {
        // timeslice = 500ms → we get data incrementally, not just on stop
        recorder.start(500);
        recording = true;
        console.log('[EpisodeRecorder] Started recording episode');

        // Safety cap — auto-stop after MAX_DURATION_MS to prevent memory leak
        safetyTimer = setTimeout(() => {
          if (recording) {
            console.warn('[EpisodeRecorder] Hit max duration (' + MAX_DURATION_MS + 'ms), auto-stopping');
            api.stop();
          }
        }, MAX_DURATION_MS);
      } catch (e) {
        console.error('[EpisodeRecorder] start() threw:', e);
        recording = false;
      }
    },

    stop(): Promise<Blob | null> {
      return new Promise((resolve) => {
        // Clear the safety timer
        if (safetyTimer) {
          clearTimeout(safetyTimer);
          safetyTimer = null;
        }

        // If not recording or no recorder, resolve immediately
        if (!recording || !recorder) {
          console.warn('[EpisodeRecorder] stop() called but not recording');
          recording = false;
          return resolve(null);
        }

        let resolved = false;

        const safeResolve = (value: Blob | null) => {
          if (resolved) return;
          resolved = true;
          resolve(value);
        };

        const onStop = () => {
          try {
            recorder?.removeEventListener('stop', onStop);
          } catch { }

          recording = false;

          if (!chunks.length) {
            console.warn('[EpisodeRecorder] Stopped but no chunks collected');
            return safeResolve(null);
          }

          const blob = new Blob(chunks, {
            type: recorder?.mimeType || mimeType,
          });
          chunks = [];
          recorder = null;

          console.log('[EpisodeRecorder] Stopped. Blob size:', blob.size, 'bytes, type:', blob.type);
          safeResolve(blob.size > 0 ? blob : null);
        };

        recorder.addEventListener('stop', onStop);

        try {
          if (recorder.state !== 'inactive') {
            recorder.stop();
          } else {
            console.warn('[EpisodeRecorder] Recorder already inactive when stop() called');
            recording = false;
            recorder = null;
            safeResolve(null);
          }
        } catch (e) {
          console.warn('[EpisodeRecorder] stop() threw:', e);
          recording = false;
          recorder = null;
          safeResolve(null);
        }

        // Hard safety net — never hang the caller even if 'stop' event never fires
        setTimeout(() => {
          if (!resolved) {
            console.warn('[EpisodeRecorder] Safety net: stop promise timed out after 3s');
            recording = false;
            recorder = null;
            safeResolve(null);
          }
        }, 3000);
      });
    },

    get isRecording() {
      return recording;
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      console.log('[EpisodeRecorder] Destroying');

      if (safetyTimer) {
        clearTimeout(safetyTimer);
        safetyTimer = null;
      }

      try {
        if (recorder && recorder.state !== 'inactive') {
          recorder.stop();
        }
      } catch { }

      recorder = null;
      chunks = [];
      recording = false;
    },
  };

  return api;
}

function negotiateMime(): string {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const mime of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(mime)) {
        console.log('[EpisodeRecorder] Using MIME:', mime);
        return mime;
      }
    } catch { }
  }
  console.warn('[EpisodeRecorder] No preferred MIME supported, falling back to video/webm');
  return 'video/webm';
}

export function sanitizeMime(mime: string): string {
  if (!mime) return 'video/webm';
  const base = mime.split(';')[0].trim();
  return base || 'video/webm';
}