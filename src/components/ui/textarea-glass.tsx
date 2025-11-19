import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaGlassVariants = cva(
  "flex min-h-[80px] w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 placeholder:text-muted-foreground/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none",
  {
    variants: {
      variant: {
        default: [
          "bg-background/40 backdrop-blur-md",
          "border-border/50",
          "focus-visible:bg-background/60 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20",
          "hover:border-primary/30",
        ],
        solid: [
          "bg-background border-border",
          "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
        ],
        ghost: [
          "bg-transparent border-border/30",
          "focus-visible:bg-background/20 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface TextareaGlassProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaGlassVariants> {}

const TextareaGlass = React.forwardRef<HTMLTextAreaElement, TextareaGlassProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaGlassVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
TextareaGlass.displayName = "TextareaGlass";

export { TextareaGlass, textareaGlassVariants };
