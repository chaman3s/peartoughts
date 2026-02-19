import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  style:React.CSSProperties
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
      className={className}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
