import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ModalBlur = DialogPrimitive.Root;
const ModalBlurTrigger = DialogPrimitive.Trigger;
const ModalBlurPortal = DialogPrimitive.Portal;
const ModalBlurClose = DialogPrimitive.Close;

const modalBlurOverlayVariants = cva(
  "fixed inset-0 z-[1000] flex items-center justify-center p-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  {
    variants: {
      blur: {
        none: "bg-black/50",
        light: "backdrop-blur-sm bg-black/30",
        medium: "backdrop-blur-md bg-black/40",
        strong: "backdrop-blur-lg bg-black/50",
        glass: "backdrop-blur-xl bg-white-alpha-10 dark:bg-black-alpha-20",
      },
    },
    defaultVariants: {
      blur: "strong",
    },
  }
);

const modalBlurContentVariants = cva(
  "relative z-[1001] grid w-full gap-4 rounded-2xl border shadow-z5 duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-[2%] data-[state=open]:slide-in-from-bottom-[2%] preserve-3d motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "bg-background border-border p-6",
        glass: "glass backdrop-blur-[20px] bg-white-alpha-20 dark:bg-black-alpha-30 border-white-alpha-20 dark:border-black-alpha-20 p-6",
        solid: "bg-bg-elevated-2 border-border p-6 shadow-z6",
        gradient: "bg-gradient-glass border-white-alpha-20 p-6",
      },
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        full: "max-w-[95vw] max-h-[95vh]",
      },
    },
    defaultVariants: {
      variant: "glass",
      size: "md",
    },
  }
);

interface ModalBlurOverlayProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>,
    VariantProps<typeof modalBlurOverlayVariants> {}

const ModalBlurOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  ModalBlurOverlayProps
>(({ className, blur, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(modalBlurOverlayVariants({ blur, className }))}
    {...props}
  />
));
ModalBlurOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface ModalBlurContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalBlurContentVariants> {
  blur?: VariantProps<typeof modalBlurOverlayVariants>["blur"];
}

const ModalBlurContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalBlurContentProps
>(({ className, variant, size, blur = "strong", children, ...props }, ref) => (
  <ModalBlurPortal>
    <ModalBlurOverlay blur={blur} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(modalBlurContentVariants({ variant, size, className }))}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-white-alpha-20 dark:hover:bg-black-alpha-20 p-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Fechar</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </ModalBlurPortal>
));
ModalBlurContent.displayName = DialogPrimitive.Content.displayName;

const ModalBlurHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
);
ModalBlurHeader.displayName = "ModalBlurHeader";

const ModalBlurFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
ModalBlurFooter.displayName = "ModalBlurFooter";

const ModalBlurTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-xl sm:text-2xl font-bold leading-none tracking-tight", className)}
    {...props}
  />
));
ModalBlurTitle.displayName = DialogPrimitive.Title.displayName;

const ModalBlurDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ModalBlurDescription.displayName = DialogPrimitive.Description.displayName;

export {
  ModalBlur,
  ModalBlurPortal,
  ModalBlurOverlay,
  ModalBlurTrigger,
  ModalBlurClose,
  ModalBlurContent,
  ModalBlurHeader,
  ModalBlurFooter,
  ModalBlurTitle,
  ModalBlurDescription,
  modalBlurOverlayVariants,
  modalBlurContentVariants,
};
