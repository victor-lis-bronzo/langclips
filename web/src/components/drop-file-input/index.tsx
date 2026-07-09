import React, { useRef, useState, useImperativeHandle } from "react";
import { Upload } from "lucide-react";
import { cn } from "#/lib/utils";

export type DropFileProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  containerClassName?: string;
};

export const DropFileInput = React.forwardRef<HTMLInputElement, DropFileProps>(
  (
    {
      title = "Preparado para começar?",
      description = "Arraste um vídeo ou clique para enviar",
      icon = <Upload size={32} className="text-white" />,
      containerClassName,
      onChange,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileDescription, setFileDescription] = useState(description);

    useImperativeHandle(ref, () => inputRef.current!);

    const handleClick = () => {
      inputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = () => {
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (
        e.dataTransfer.files &&
        e.dataTransfer.files.length > 0 &&
        inputRef.current
      ) {
        inputRef.current.files = e.dataTransfer.files;

        const event = new Event("change", { bubbles: true });
        inputRef.current.dispatchEvent(event);

        if (onChange) {
          const changeEvent = {
            target: inputRef.current,
            currentTarget: inputRef.current,
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(changeEvent);
        }
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setFileDescription(`Analisando: ${e.target.files[0].name}`);
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex-1 flex flex-col items-center justify-center border-2 border-dashed gap-6 min-h-[450px] my-4 rounded-xl cursor-pointer transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-border hover:border-muted-foreground bg-card hover:bg-card/80",
          containerClassName,
        )}
      >
        <input
          {...props}
          type="file"
          ref={inputRef}
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-primary border-2 border-border group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="text-center pointer-events-none select-none">
          {typeof title === "string" ? (
            <h1 className="mb-2 text-white font-bold text-lg uppercase">
              {title}
            </h1>
          ) : (
            title
          )}
          {typeof fileDescription === "string" ? (
            <p className="text-muted-foreground font-inter text-sm">
              {fileDescription}
            </p>
          ) : (
            fileDescription
          )}
        </div>
      </div>
    );
  },
);

DropFileInput.displayName = "DropFileInput";
