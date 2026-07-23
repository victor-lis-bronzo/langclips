import { createFileRoute } from "@tanstack/react-router";
import { Film, Github, Linkedin, Sparkles } from "lucide-react";
import { Container } from "#/components/container";
import { DropFileForm } from "#/features/home/components/upload-file-form";
import { AlertExistentDeckDialog } from "#/features/home/components/alert-existent-deck-dialog";

export const Route = createFileRoute("/")({
	component: HomeScreen,
});

function HomeScreen() {
	return (
		<div className="flex flex-col min-h-screen relative overflow-hidden bg-background text-foreground selection:bg-primary/30 selection:text-white">
			<div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
			<div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
			<HomePage />
			<AlertExistentDeckDialog />
		</div>
	);
}

function HomePage() {
	return (
		<Container className="flex-1 flex flex-col justify-between relative z-10 py-8">
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center py-6 md:py-12 flex-1 w-full">
				<div className="lg:col-span-6 flex flex-col items-start text-left animate-in fade-in slide-in-from-left duration-700">
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
						Transform videos into{" "}
						<span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
							practical lessons
						</span>
					</h1>

					<p className="text-lg text-white/80 font-medium mb-3 max-w-xl">
						LangClips is an interactive English learning platform. Here you
						analyze your favorite videos to translate, understand, and memorize.
					</p>

					<p className="text-sm font-caveat text-primary/95 mb-8 max-w-md">
						Just drag or select the file on the side. No registration, no
						hassle, 100% free.
					</p>

					<div className="space-y-5 w-full max-w-lg mt-2">
						<div className="flex gap-4 items-start group">
							<div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-primary group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
								<Sparkles className="w-5 h-5" />
							</div>
							<div>
								<h3 className="font-semibold text-white text-sm sm:text-base">
									Smart Analysis & Transcription
								</h3>
								<p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
									Detailed translation, vocabulary breakdown, and context made
									simple.
								</p>
							</div>
						</div>

						<div className="flex gap-4 items-start group">
							<div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-primary group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
								<Film className="w-5 h-5" />
							</div>
							<div>
								<h3 className="font-semibold text-white text-sm sm:text-base">
									Study What You Love
								</h3>
								<p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
									Use clips from TV shows, movies, anime, or music to learn for
									real.
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="lg:col-span-6 w-full animate-in fade-in slide-in-from-right duration-700">
					<div className="relative">
						<div className="absolute inset-0 bg-primary/5 rounded-2xl filter blur-xl -m-4 pointer-events-none" />
						<DropFileForm />
					</div>
				</div>
			</div>

			<footer className="w-full border-t border-white/5 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground animate-in fade-in duration-1000">
				<div>
					Made by{" "}
					<span className="text-white font-semibold">Victor Lis Bronzo</span>
				</div>
				<div className="flex items-center gap-6">
					<a
						href="https://github.com/victor-lis-bronzo"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 hover:text-white transition-colors"
					>
						<Github className="w-4 h-4" />
						<span>GitHub</span>
					</a>
					<a
						href="https://linkedin.com/in/victor-lis-bronzo"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 hover:text-white transition-colors"
					>
						<Linkedin className="w-4 h-4" />
						<span>LinkedIn</span>
					</a>
				</div>
			</footer>
		</Container>
	);
}
