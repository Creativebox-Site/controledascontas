import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardGlassVariants = cva(
  "relative p-4 sm:p-5 md:p-6 rounded-xl overflow-hidden preserve-3d transition-all duration-300 before:absolute before:inset-0 before:-translate-x-1/2 before:-translate-y-1/2 before:w-[200%] before:h-[200%] before:opacity-0 hover:before:opacity-100 before:pointer-events-none before:transition-opacity before:duration-300 motion-reduce:transition-none motion-reduce:hover:transform-none",
  {
    variants: {
      variant: {
        light: "glass backdrop-blur-[12px] bg-white-alpha-10 border border-white-alpha-20 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] before:bg-[radial-gradient(circle,hsla(217,91%,60%,0.1),transparent_70%)]",
        dark: "backdrop-blur-[16px] bg-black-alpha-20 border border-black-alpha-20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] before:bg-[radial-gradient(circle,hsla(217,91%,60%,0.15),transparent_70%)]",
        strong: "glass-strong backdrop-blur-[16px] bg-white-alpha-20 dark:bg-black-alpha-20 border border-white-alpha-20 dark:border-black-alpha-20 shadow-z3 before:bg-[radial-gradient(circle,hsla(217,91%,60%,0.2),transparent_70%)]",
        gradient: "bg-gradient-glass backdrop-blur-[12px] border border-white-alpha-20 shadow-z2 before:bg-[radial-gradient(circle,hsla(142,76%,36%,0.1),transparent_70%)]",
      },
      elevation: {
        flat: "shadow-none",
        low: "shadow-z1",
        medium: "shadow-z2 hover:shadow-z3",
        high: "shadow-z3 hover:shadow-z4",
        highest: "shadow-z4 hover:shadow-z5",
      },
      effect: {
        none: "",
        subtle: "hover:-translate-y-0.5",
        default: "hover:-translate-y-1 hover:rotate-x-[2deg]",
        strong: "hover:-translate-y-2 hover:rotate-x-[3deg] hover:scale-[1.02]",
      },
      padding: {
        none: "p-0",
        sm: "p-3 sm:p-4",
        md: "p-4 sm:p-5 md:p-6",
        lg: "p-6 sm:p-7 md:p-8",
      },
    },
    defaultVariants: {
      variant: "light",
      elevation: "medium",
      effect: "default",
      padding: "md",
    },
  }
);

export interface CardGlassProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardGlassVariants> {
  asChild?: boolean;
}

const CardGlass = React.forwardRef<HTMLDivElement, CardGlassProps>(
  ({ className, variant, elevation, effect, padding, children, ...props }, ref) => {
    return (
      <div
        className={cn(cardGlassVariants({ variant, elevation, effect, padding, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardGlass.displayName = "CardGlass";

const CardGlassHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
CardGlassHeader.displayName = "CardGlassHeader";

const CardGlassTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl sm:text-2xl font-bold tracking-tight", className)}
    {...props}
  />
));
CardGlassTitle.displayName = "CardGlassTitle";

const CardGlassDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardGlassDescription.displayName = "CardGlassDescription";

const CardGlassContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardGlassContent.displayName = "CardGlassContent";

const CardGlassFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
CardGlassFooter.displayName = "CardGlassFooter";

export {
  CardGlass,
  CardGlassHeader,
  CardGlassTitle,
  CardGlassDescription,
  CardGlassContent,
  CardGlassFooter,
  cardGlassVariants,
};
