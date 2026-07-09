import { cn } from "#/lib/utils";

type HeaderRoot = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export default function HeaderRoot({
  children,
  className,
  ...rest
}: HeaderRoot) {
  return (
    <header className={cn("flex flex-col w-full", className)} {...rest}>
      {children}
    </header>
  );
}
