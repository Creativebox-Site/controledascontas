import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputGlassVariants = cva(
  "flex w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
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
      inputSize: {
        sm: "h-9 px-3 py-2 text-xs",
        md: "h-10 px-4 py-3 text-sm",
        lg: "h-12 px-5 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  }
);

export interface InputGlassProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputGlassVariants> {}

const InputGlass = React.forwardRef<HTMLInputElement, InputGlassProps>(
  ({ className, variant, inputSize, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputGlassVariants({ variant, inputSize }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
InputGlass.displayName = "InputGlass";

export { InputGlass, inputGlassVariants };
