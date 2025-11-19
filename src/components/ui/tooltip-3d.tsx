import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const Tooltip3DProvider = TooltipPrimitive.Provider;
const Tooltip3D = TooltipPrimitive.Root;
const Tooltip3DTrigger = TooltipPrimitive.Trigger;

const tooltip3DContentVariants = cva(
  "z-50 overflow-hidden rounded-lg px-3 py-2 text-sm preserve-3d transition-all duration-200 will-change-transform data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 before:absolute before:inset-0 before:rounded-inherit before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none before:transform before:translate-z-[1px] motion-reduce:transition-none motion-reduce:data-[state=delayed-open]:animate-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-z3 border border-primary-alpha-20",
        glass: "glass backdrop-blur-[12px] bg-white-alpha-20 dark:bg-black-alpha-30 text-foreground border border-white-alpha-20 dark:border-black-alpha-20 shadow-z2",
        dark: "bg-black-alpha-80 text-white border border-white-alpha-10 shadow-z3",
        gradient: "bg-gradient-primary text-white shadow-glow-primary border border-primary-alpha-30",
        success: "bg-gradient-success text-white shadow-glow-success border border-accent/20",
      },
      effect: {
        none: "",
        subtle: "data-[state=delayed-open]:translate-y-[-2px] data-[state=delayed-open]:scale-[1.02]",
        default: "data-[state=delayed-open]:translate-y-[-4px] data-[state=delayed-open]:scale-105",
        strong: "data-[state=delayed-open]:translate-y-[-6px] data-[state=delayed-open]:scale-110 data-[state=delayed-open]:rotate-x-[3deg]",
      },
    },
    defaultVariants: {
      variant: "glass",
      effect: "default",
    },
  }
);

interface Tooltip3DContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltip3DContentVariants> {}

const Tooltip3DContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  Tooltip3DContentProps
>(({ className, variant, effect, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(tooltip3DContentVariants({ variant, effect, className }))}
    {...props}
  />
));
Tooltip3DContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Tooltip 3D - Componente de tooltip com efeitos 3D e glassmorphism
 * 
 * @example
 * ```tsx
 * <Tooltip3DProvider>
 *   <Tooltip3D>
 *     <Tooltip3DTrigger>Hover me</Tooltip3DTrigger>
 *     <Tooltip3DContent variant="glass" effect="strong">
 *       Beautiful 3D Tooltip
 *     </Tooltip3DContent>
 *   </Tooltip3D>
 * </Tooltip3DProvider>
 * ```
 */
export {
  Tooltip3D,
  Tooltip3DTrigger,
  Tooltip3DContent,
  Tooltip3DProvider,
  tooltip3DContentVariants,
};
