import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "btn-mobile transition-all duration-200 active:scale-95",
  {
    variants: {
      variant: {
        default: "gradient-primary text-primary-foreground hover:shadow-button active:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-error",
        outline:
          "border border-input bg-card hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline min-h-auto shadow-none",
        success: "gradient-success text-success-foreground hover:shadow-success active:shadow-none",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        mobile: "bg-primary text-primary-foreground rounded-xl shadow-button active:shadow-sm",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-10 rounded-lg px-4 text-sm",
        lg: "h-14 rounded-xl px-8 text-lg",
        icon: "h-12 w-12 rounded-xl",
        mobile: "h-12 px-6 text-base font-medium rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };