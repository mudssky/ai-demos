import type * as React from "react";
import { cn } from "@/lib/utils";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  hint?: string;
};

function Label({ className, children, hint, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      htmlFor={props.htmlFor}
      className={cn(
        "text-sm font-medium leading-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
      {hint ? <span className="ml-2 text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export { Label };
