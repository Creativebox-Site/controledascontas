import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonPremiumVariants = cva(
  "relative inline-flex items-center justify-center gap-2 px-5 py-2.5 font-medium text-sm rounded-lg overflow-hidden cursor-pointer border-0 transition-all duration-200 will-change-transform shadow-z1 hover:shadow-z2 active:shadow-z1 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:transform-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:opacity-90 active:opacity-80 focus-visible:outline-primary",
        success: "bg-income text-white hover:opacity-90 active:opacity-80 focus-visible:outline-income",
        expense: "bg-expense text-white hover:opacity-90 active:opacity-80 focus-visible:outline-expense",
        investment: "bg-investment text-white hover:opacity-90 active:opacity-80 focus-visible:outline-investment",
        glass: "bg-muted text-foreground border border-border hover:bg-muted/80 active:bg-muted/60 focus-visible:outline-primary",
      },
      size: {
        sm: "px-3 py-2 text-xs rounded-md",
        md: "px-5 py-2.5 text-sm rounded-lg",
        lg: "px-6 py-3 text-base rounded-lg",
      },
      effect: {
        default: "hover:-translate-y-px active:translate-y-0",
        strong: "hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-100",
        subtle: "",
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
