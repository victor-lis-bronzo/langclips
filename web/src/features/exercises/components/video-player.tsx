import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import useGetClipBlob from "../hooks/use-get-clip-blob";

interface VideoPlayerProps {
	deckId: string;
	clipId: string;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5];

export default function VideoPlayer({ deckId, clipId }: VideoPlayerProps) {
	const { data: blob, isLoading, isError } = useGetClipBlob({ deckId, clipId });
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [speed, setSpeed] = useState(1.0);
	const [showControlsOverlay, setShowControlsOverlay] = useState(true);

	const videoUrl = useMemo(() => {
		if (!blob) return null;
		return URL.createObjectURL(blob);
	}, [blob]);

	useEffect(() => {
		return () => {
			if (videoUrl) {
				URL.revokeObjectURL(videoUrl);
			}
		};
	}, [videoUrl]);

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.playbackRate = speed;
		}
	}, [speed]);

	const handlePlay = () => {
		setIsPlaying(true);
		setTimeout(() => {
			if (videoRef.current && !videoRef.current.paused) {
				setShowControlsOverlay(false);
			}
		}, 1500);
	};

	const handlePause = () => {
		setIsPlaying(false);
		setShowControlsOverlay(true);
	};

	const togglePlay = () => {
		if (!videoRef.current) return;
		if (isPlaying) {
			videoRef.current.pause();
		} else {
			videoRef.current.play().catch((err) => {
				console.error("Playback failed:", err);
			});
		}
	};

	const handleReplay = () => {
		if (!videoRef.current) return;
		videoRef.current.currentTime = 0;
		videoRef.current.play().catch((err) => {
			console.error("Replay playback failed:", err);
		});
		setIsPlaying(true);
	};

	const cycleSpeed = () => {
		setSpeed((prevSpeed) => {
			const currentIndex = PLAYBACK_SPEEDS.indexOf(prevSpeed);
			const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
			return PLAYBACK_SPEEDS[nextIndex];
		});
	};

	const handleLoadedMetadata = () => {
		if (videoRef.current) {
			videoRef.current.playbackRate = speed;
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4 w-full">
				<div className="w-full aspect-video rounded-2xl bg-zinc-900 border border-white/5 relative overflow-hidden shadow-2xl">
					<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer-progress" />
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-16 h-16 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
							<Play className="w-6 h-6 text-zinc-600 animate-pulse" />
						</div>
					</div>
				</div>

				<div className="flex gap-4 w-full">
					<div className="h-11 flex-1 sm:flex-initial sm:w-32 rounded-xl bg-zinc-900 border border-white/5 relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer-progress" />
					</div>
					<div className="h-11 flex-1 sm:flex-initial sm:w-32 rounded-xl bg-zinc-900 border border-white/5 relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer-progress" />
					</div>
				</div>
			</div>
		);
	}

	if (isError || !videoUrl) {
		return (
			<div className="w-full aspect-video rounded-2xl bg-zinc-900 border border-white/5 flex flex-col items-center justify-center gap-3 p-6 text-center shadow-lg">
				<div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
					<span className="text-xl font-bold font-inter">!</span>
				</div>
				<div>
					<h3 className="font-semibold text-zinc-200">Could not load video</h3>
					<p className="text-sm text-zinc-500 mt-1">
						Make sure the corresponding file is saved locally.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 w-full">
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: hover interaction only toggles overlay visibility */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: hover interaction only toggles overlay visibility */}
			<div
				className="group w-full aspect-video rounded-2xl bg-black border border-white/10 relative overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-primary/5 hover:border-white/15"
				onMouseEnter={() => setShowControlsOverlay(true)}
				onMouseLeave={() => isPlaying && setShowControlsOverlay(false)}
			>
				{/* biome-ignore lint/a11y/useMediaCaption: video clip training does not require secondary tracks */}
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: clicking video is standard play/pause shortcut */}
				<video
					ref={videoRef}
					src={videoUrl}
					onClick={togglePlay}
					onPlay={handlePlay}
					onPause={handlePause}
					onLoadedMetadata={handleLoadedMetadata}
					className="w-full h-full object-contain cursor-pointer rounded-2xl border-2 border-white"
					playsInline
				/>

				<div
					className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${
						showControlsOverlay ? "bg-black/30 opacity-100" : "opacity-0"
					}`}
				>
					<button
						type="button"
						onClick={togglePlay}
						className="pointer-events-auto w-16 h-16 flex items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-md text-white shadow-xl transform active:scale-95 hover:scale-105 hover:bg-black/70 hover:border-white/35 transition-all duration-200 cursor-pointer"
						aria-label={isPlaying ? "Pause video" : "Play video"}
					>
						{isPlaying ? (
							<Pause className="w-6 h-6 fill-white" />
						) : (
							<Play className="w-6 h-6 fill-white translate-x-0.5" />
						)}
					</button>
				</div>
			</div>

			<div className="flex gap-4 w-full">
				<button
					type="button"
					onClick={handleReplay}
					className="flex-1 flex items-center justify-center gap-2 py-2.5 px-6 border border-white rounded-md bg-white/[0.03] hover:bg-white/[0.08] active:scale-98 transition-all duration-200 text-zinc-200 hover:text-white cursor-pointer group"
				>
					<RotateCcw className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors duration-300" />
					<span className="text-sm font-caveat font-medium">Replay</span>
				</button>

				<button
					type="button"
					onClick={cycleSpeed}
					className="flex-1 flex items-center justify-center gap-2.5 py-2.5 px-5 border border-white rounded-md bg-white/[0.03] hover:bg-white/[0.08] active:scale-98 transition-all duration-200 text-zinc-200 hover:text-white cursor-pointer"
				>
					{speed.toFixed(2)}x
					<span className="text-sm font-caveat font-medium sm:inline hidden">
						Speed
					</span>
				</button>
			</div>
		</div>
	);
}
