import clsx from "clsx";
import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  rounded?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, rounded, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={clsx(rounded && "rounded-full", className)}
      {...props}
    />
  );
});

export default Input;
