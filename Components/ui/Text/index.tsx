import React from "react";
import clsx from "clsx";

type TextProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export default function Text<T extends React.ElementType = "p">({
  as,
  className,
  children,
  ...rest
}: TextProps<T>) {
  const Component = as || "p";

  return (
    <Component className={clsx(className)} {...rest}>
      {children}
    </Component>
  );
}