import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "dark" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="size-5 text-emerald-400 shrink-0" />,
				info: <InfoIcon className="size-5 text-sky-400 shrink-0" />,
				warning: <TriangleAlertIcon className="size-5 text-amber-400 shrink-0" />,
				error: <OctagonXIcon className="size-5 text-rose-400 shrink-0" />,
				loading: <Loader2Icon className="size-5 text-primary animate-spin shrink-0" />,
			}}
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-zinc-950/90 group-[.toaster]:text-zinc-100 group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:font-sans",
					description: "group-[.toast]:text-zinc-400 group-[.toast]:text-xs mt-1",
					actionButton:
						"group-[.toast]:bg-primary group-[.toast]:text-zinc-950 group-[.toast]:font-semibold group-[.toast]:rounded-xl group-[.toast]:px-3 group-[.toast]:py-1.5",
					cancelButton:
						"group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-300 group-[.toast]:rounded-xl group-[.toast]:px-3 group-[.toast]:py-1.5",
				},
			}}
			style={
				{
					"--normal-bg": "rgba(9, 9, 11, 0.9)",
					"--normal-text": "#f4f4f5",
					"--normal-border": "rgba(255, 255, 255, 0.1)",
					"--border-radius": "1rem",
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
