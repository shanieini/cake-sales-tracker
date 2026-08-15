"use client";

import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = Omit<ComponentProps<"input">, "type"> & {
  placeholder: string;
};

/**
 * A date input that shows a placeholder. Native `type="date"` inputs can't have
 * one — they render today's date in dark text, which looks filled and
 * inconsistent. This keeps a real date input (so pickers and form submission
 * behave normally) but, while it's empty and unfocused, hides the native text
 * and overlays a muted placeholder like every other field.
 */
export default function DateField({
  placeholder,
  defaultValue,
  className,
  onChange,
  onFocus,
  onBlur,
  ...props
}: Props) {
  const [empty, setEmpty] = useState(!defaultValue);
  const [focused, setFocused] = useState(false);
  const showPlaceholder = empty && !focused;

  return (
    // The caller's className (flex-1, w-full…) sizes this wrapper so the field
    // lays out like a plain input; the input inside keeps a fixed height so it
    // matches every other field (a flex-1 wrapper has no height for h-full).
    <div className={cn("relative", className)}>
      <Input
        {...props}
        type="date"
        defaultValue={defaultValue}
        // iOS Safari ignores height on a native date control and sizes it to
        // its own content; `appearance-none` makes it a normal box that
        // respects h-11, so it matches the other fields on a real phone.
        className={cn(
          "h-11 w-full appearance-none",
          showPlaceholder && "text-transparent",
        )}
        onChange={(event) => {
          setEmpty(!event.currentTarget.value);
          onChange?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
      />
      {showPlaceholder && (
        <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center px-3.5 text-base text-muted-foreground not-any-pointer-coarse:text-sm">
          {placeholder}
        </span>
      )}
    </div>
  );
}
