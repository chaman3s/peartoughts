import React from "react";
import clsx from "clsx";

type ButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  className,
  disabled,
  loading,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "px-4 py-2 sm:py-3 md:py-4 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl",
        "transition-all duration-300 transform",
        "hover:scale-105 active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
