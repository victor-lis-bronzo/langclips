import { cn } from "#/lib/utils";

type HeaderTitle = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLHeadingElement>;

export default function HeaderTitle({
  children,
  className,
  ...rest
}: HeaderTitle) {
  return (
    <h1
      className={cn(
        "font-caveat font-bold tracking-tight text-[48px] leading-tight text-white",
        className,
      )}
      {...rest}
    >
      {children}
    </h1>
  );
}
