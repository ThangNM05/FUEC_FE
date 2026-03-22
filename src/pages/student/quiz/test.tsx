import { useEffect, useRef, useState } from 'react'
import { HeadPoseEstimator } from '@/lib/ExamProctoring'
import type { AttentionState } from '@/lib/ExamProctoring'
import { uploadCheatSnapshot } from '@/lib/uploadCheatSnapshot'

export default function Index() {
	const videoRef = useRef<HTMLVideoElement | null>(null)
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const engineRef = useRef<HeadPoseEstimator | null>(null)
	const streamRef = useRef<MediaStream | null>(null)

	const lastStateRef = useRef<AttentionState | undefined>(undefined)
	const lastFacesRef = useRef<
		Array<{ x: number; y: number; width: number; height: number }>
	>([])
	const displayedGazeRef = useRef<{ yaw: number; pitch: number } | null>(null)
	const displayedFacesRef = useRef<
		Array<{ x: number; y: number; width: number; height: number }>
	>([])

	const [started, setStarted] = useState(false)
	const [ready, setReady] = useState(false)

	/* =====================
	   Start proctoring
	===================== */
	const start = async () => {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: { width: 640, height: 480 },
		})
		streamRef.current = stream

		if (!videoRef.current) return
		videoRef.current.srcObject = stream
		await videoRef.current.play()

		const engine = new HeadPoseEstimator()
		await engine.init()

		engineRef.current = engine
		setReady(true)
		setStarted(true)
	}

	/* =====================
	   Main loop
	===================== */
	useEffect(() => {
		if (!ready) return

		let rafId = 0
		let inferenceTimer: number | null = null
		let stopped = false
		let inFlight = false

		const video = videoRef.current!
		const canvas = canvasRef.current!
		const ctx = canvas.getContext('2d')!

		const ensureCanvasSize = () => {
			if (video.videoWidth === 0 || video.videoHeight === 0) return false
			if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth
			if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight
			return true
		}

		// Smooth draw loop (RAF)
		const drawLoop = () => {
			rafId = requestAnimationFrame(drawLoop)
			if (!ensureCanvasSize()) return

			ctx.clearRect(0, 0, canvas.width, canvas.height)

			const a = 0.18
			const state = lastStateRef.current
			let faces = lastFacesRef.current

			/* ---- Smooth face box ---- */
			if (faces.length) {
				const curFaces = displayedFacesRef.current
				if (!curFaces.length) displayedFacesRef.current = faces
				else if (faces[0] && curFaces[0]) {
					const f0 = faces[0]
					const c0 = curFaces[0]
					displayedFacesRef.current = [
						{
							x: c0.x + a * (f0.x - c0.x),
							y: c0.y + a * (f0.y - c0.y),
							width: c0.width + a * (f0.width - c0.width),
							height: c0.height + a * (f0.height - c0.height),
						},
					]
				}
				faces = displayedFacesRef.current
			}

			/* ---- Smooth gaze ---- */
			let smoothedState = state
			if (state?.gaze) {
				const cur =
					displayedGazeRef.current ??
					{ yaw: state.gaze.yaw, pitch: state.gaze.pitch }

				displayedGazeRef.current = {
					yaw: cur.yaw + a * (state.gaze.yaw - cur.yaw),
					pitch: cur.pitch + a * (state.gaze.pitch - cur.pitch),
				}

				smoothedState = {
					...state,
					gaze: {
						...state.gaze,
						yaw: displayedGazeRef.current.yaw,
						pitch: displayedGazeRef.current.pitch,
					},
				}
			}

			draw(ctx, smoothedState, faces)
		}

		const INFERENCE_FPS = 5
		const INFERENCE_INTERVAL_MS = Math.round(1000 / INFERENCE_FPS)

		// Heavy inference loop (~5 FPS)
		const inferenceLoop = async () => {
			if (stopped) return
			if (!engineRef.current || video.videoWidth === 0) {
				inferenceTimer = window.setTimeout(inferenceLoop, 250)
				return
			}
			if (inFlight) {
				inferenceTimer = window.setTimeout(inferenceLoop, INFERENCE_INTERVAL_MS)
				return
			}

			inFlight = true
			try {
				const ts = performance.now()
				const result = await engineRef.current.estimate(video, ts)
				lastStateRef.current = result.state
				lastFacesRef.current = result.faces

				/* ---- capture snapshot when cheating is confirmed ---- */
				const st = result.state?.status
				if (st && st !== 'safe' && st !== 'suspicious') {
					uploadCheatSnapshot(video, st)
				}
			} finally {
				inFlight = false
				inferenceTimer = window.setTimeout(inferenceLoop, INFERENCE_INTERVAL_MS)
			}
		}

		drawLoop()
		inferenceLoop()

		return () => {
			stopped = true
			cancelAnimationFrame(rafId)
			if (inferenceTimer) window.clearTimeout(inferenceTimer)
		}
	}, [ready])

	useEffect(() => {
		return () => {
			streamRef.current?.getTracks().forEach(t => t.stop())
			streamRef.current = null
		}
	}, [])

	return (
		<div style={{ width: 640 }}>
			{!started && (
				<button onClick={start} style={btnStyle}>
					Start Proctoring
				</button>
			)}

			<div
				style={{
					position: 'relative',
					width: '100%',
					borderRadius: 12,
					overflow: 'hidden',
					background: '#000',
				}}
			>
				<video
					ref={videoRef}
					playsInline
					muted
					autoPlay
					style={{
						width: '100%',
						display: 'block',
						transform: 'scaleX(-1)',
					}}
				/>

				<canvas
					ref={canvasRef}
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						pointerEvents: 'none',
						transform: 'scaleX(-1)',
					}}
				/>
			</div>
		</div>
	)
}

/* =====================
   Drawing
===================== */

function draw(
	ctx: CanvasRenderingContext2D,
	state?: AttentionState,
	faces: Array<{ x: number; y: number; width: number; height: number }> = []
) {
	if (!state) return

	/* ---- Face box ---- */
	ctx.strokeStyle = '#00ff88'
	ctx.lineWidth = 2
	for (const f of faces) {
		ctx.strokeRect(f.x, f.y, f.width, f.height)
	}

	/* ---- Gaze arrow (FIXED LOGIC) ---- */
	if (state.gaze && faces[0]) {
		const face = faces[0]
		const cx = face.x + face.width / 2
		const cy = face.y + face.height / 2

		const maxLen = Math.min(face.width, face.height) * 0.8

		const yawRad = (state.gaze.yaw * Math.PI) / 180
		const pitchRad = (state.gaze.pitch * Math.PI) / 180

		const dx = -Math.sin(yawRad) * maxLen
		const dy = -Math.sin(pitchRad) * maxLen

		const conf = Math.max(0, Math.min(1, state.gaze.confidence))
		ctx.globalAlpha = 0.25 + 0.75 * conf
		drawArrow(ctx, cx, cy, dx, dy, '#ffcc00')
		ctx.globalAlpha = 1
	}

	/* ---- HUD ---- */
	ctx.save()
	ctx.scale(-1, 1)
	ctx.fillStyle = '#fff'
	ctx.font = '13px monospace'
	ctx.fillText(`Faces: ${state.facesCount}`, -ctx.canvas.width + 10, 20)

	if (state.gaze) {
		ctx.fillText(`Yaw: ${state.gaze.yaw.toFixed(1)}°`, -ctx.canvas.width + 10, 40)
		ctx.fillText(`Pitch: ${state.gaze.pitch.toFixed(1)}°`, -ctx.canvas.width + 10, 60)
		ctx.fillText(`Conf: ${state.gaze.confidence.toFixed(2)}`, -ctx.canvas.width + 10, 80)
	}
	ctx.fillText(`Suspicion: ${(state.suspicionScore * 100).toFixed(0)}%`, -ctx.canvas.width + 10, state.gaze ? 100 : 40)
	ctx.restore()

	/* ---- CHEAT ALERT ---- */
	if (state.status === 'suspicious') {
		ctx.strokeStyle = '#ffaa00'
		ctx.lineWidth = 6
		ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height)

		ctx.save()
		ctx.scale(-1, 1)
		ctx.fillStyle = '#ffaa00'
		ctx.font = 'bold 20px sans-serif'
		ctx.textAlign = 'center'
		ctx.shadowColor = 'black'
		ctx.shadowBlur = 4
		ctx.fillText('LOOK AT YOUR SCREEN', -ctx.canvas.width / 2, ctx.canvas.height - 50)
		ctx.restore()
	} else if (state.status && state.status !== 'safe') {
		ctx.strokeStyle = '#ff3333'
		ctx.lineWidth = 10
		ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height)

		ctx.save()
		ctx.scale(-1, 1)
		ctx.fillStyle = '#ff3333'
		ctx.font = 'bold 24px sans-serif'
		ctx.textAlign = 'center'
		ctx.shadowColor = 'black'
		ctx.shadowBlur = 4
		const msg = state.status.toUpperCase().replace('-', ' ')
		ctx.fillText(msg, -ctx.canvas.width / 2, ctx.canvas.height - 50)
		ctx.restore()
	}
	ctx.restore()
}

/* =====================
   Arrow helper
===================== */

function drawArrow(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	dx: number,
	dy: number,
	color: string
) {
	ctx.strokeStyle = color
	ctx.fillStyle = color
	ctx.lineWidth = 3

	ctx.beginPath()
	ctx.moveTo(x, y)
	ctx.lineTo(x + dx, y + dy)
	ctx.stroke()

	const angle = Math.atan2(dy, dx)
	const size = 8

	ctx.beginPath()
	ctx.moveTo(x + dx, y + dy)
	ctx.lineTo(
		x + dx - size * Math.cos(angle - Math.PI / 6),
		y + dy - size * Math.sin(angle - Math.PI / 6)
	)
	ctx.lineTo(
		x + dx - size * Math.cos(angle + Math.PI / 6),
		y + dy - size * Math.sin(angle + Math.PI / 6)
	)
	ctx.closePath()
	ctx.fill()
}

/* =====================
   UI
===================== */

const btnStyle: React.CSSProperties = {
	padding: '10px 16px',
	marginBottom: 12,
	fontSize: 16,
	borderRadius: 8,
	cursor: 'pointer',
}
