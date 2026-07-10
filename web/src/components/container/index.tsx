import { cn } from "#/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export function Container({ children, className, ...rest }: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full py-4 px-4 sm:px-0 sm:max-w-11/12 mx-auto",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
