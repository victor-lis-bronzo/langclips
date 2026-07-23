import { cn } from "#/lib/utils";
import { useEffect, useRef } from "react";

type AnswerHardProps = {
	value: string;
	onChange: (val: string) => void;
	disabled: boolean;
};

export default function AnswerHard({
	value,
	onChange,
	disabled,
}: AnswerHardProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (!disabled && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [disabled]);

	return (
		<textarea
			ref={textareaRef}
			readOnly={disabled}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className={cn(
				"w-full flex-1 bg-transparent outline-none resize-none border-l-2 border-white/50 my-4 px-4 font-inter text-base text-zinc-100 placeholder-zinc-500",
				"scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-white/5",
				disabled && "text-zinc-400 cursor-not-allowed opacity-60",
			)}
			placeholder="Type your answer here..."
			style={{
				backgroundImage:
					"repeating-linear-gradient(transparent, transparent 31px, rgba(255, 255, 255, 0.38) 31px, rgba(255, 255, 255, 0.38) 32px)",
				backgroundSize: "100% 32px",
				backgroundAttachment: "local",
				lineHeight: "32px",
			}}
		/>
	);
}
