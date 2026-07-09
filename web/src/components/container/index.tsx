import { cn } from "#/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export function Container({ children, className, ...rest }: ContainerProps) {
  return (
    <div className={cn("w-full max-w-7xl mx-auto", className)} {...rest}>
      {children}
    </div>
  );
}
