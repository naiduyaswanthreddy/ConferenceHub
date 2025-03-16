
import React from "react";
import { Button } from "@/components/ui/button";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { 
  HTMLAttributes,
  ButtonHTMLAttributes,
  ForwardRefExoticComponent,
  RefAttributes
} from "react";
import { Loader2 } from "lucide-react";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "subtle";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
}

export const AnimatedButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(({ className, asChild = false, variant, children, loading = false, ...props }, ref) => {
  const Comp = asChild ? Slot : Button;
  
  // Handle the subtle variant specially
  const subtleClassName = variant === "subtle" ? "bg-primary/10 text-primary hover:bg-primary/20" : "";
  
  // If it's a subtle variant, pass secondary to the Button component
  const buttonVariant = variant === "subtle" ? "secondary" : variant;
  
  // Only pass variant prop if not using Slot (asChild=false)
  const variantProps = asChild ? {} : { variant: buttonVariant };
  
  return (
    <Comp
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md active:shadow-sm active:translate-y-0.5",
        subtleClassName,
        className
      )}
      ref={ref}
      disabled={loading || props.disabled}
      {...variantProps}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
});

AnimatedButton.displayName = "AnimatedButton";
