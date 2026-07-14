import { cn } from "#/lib/utils";

type HeaderDescription = {
	children: React.ReactNode;
} & React.HTMLAttributes<HTMLParagraphElement>;

export default function HeaderDescription({
	children,
	className,
	...rest
}: HeaderDescription) {
	return (
		<p
			className={cn(
				"font-caveat font-bold tracking-tight text-[20px] text-white/80",
				className,
			)}
			{...rest}
		>
			{children}
		</p>
	);
}
