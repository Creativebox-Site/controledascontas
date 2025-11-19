import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonPremiumVariants = cva(
  "relative inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-sm sm:text-base rounded-xl overflow-hidden cursor-pointer border-0 preserve-3d transition-all duration-200 will-change-transform shadow-z2 hover:shadow-z3 active:shadow-z1 focus-visible:outline-2 focus-visible:outline-offset-2 before:absolute before:inset-0 before:rounded-inherit before:bg-gradient-to-b before:from-white/20 before:via-transparent before:to-black/5 before:pointer-events-none before:transform before:translate-z-[1px] motion-reduce:transition-none motion-reduce:hover:transform-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none",
  {
    variants: {
      variant: {
        primary: "bg-gradient-primary text-white hover:shadow-glow-primary focus-visible:outline-primary",
        success: "bg-gradient-success text-white hover:shadow-glow-success focus-visible:outline-accent",
        sunset: "bg-gradient-sunset text-white hover:shadow-glow-warning focus-visible:outline-warning",
        ocean: "bg-gradient-ocean text-white hover:shadow-glow-primary focus-visible:outline-primary",
        glass: "bg-gradient-glass text-foreground border border-white-alpha-20 dark:border-black-alpha-20 hover:shadow-z4 focus-visible:outline-primary",
      },
      size: {
        sm: "px-4 py-2 text-xs sm:text-sm rounded-lg",
        md: "px-6 py-3 text-sm sm:text-base rounded-xl",
        lg: "px-8 py-4 text-base sm:text-lg rounded-2xl",
      },
      effect: {
        default: "hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]",
        strong: "hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-95",
        subtle: "hover:-translate-y-px hover:scale-[1.01] active:scale-[0.99]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      effect: "default",
    },
  }
);

export interface ButtonPremiumProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonPremiumVariants> {
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const ButtonPremium = React.forwardRef<HTMLButtonElement, ButtonPremiumProps>(
  ({ className, variant, size, effect, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonPremiumVariants({ variant, size, effect, className }))}
        ref={ref}
        {...props}
      >
        {leftIcon && <span className="inline-flex items-center">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="inline-flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);

ButtonPremium.displayName = "ButtonPremium";

export { ButtonPremium, buttonPremiumVariants };
