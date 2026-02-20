type ElementType =
  | "p"
  | "span"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "label";

type TextProps<T extends ElementType> = {
  as?: T;
  children: React.ReactNode;
  className?: string;
  stl?: React.CSSProperties;
} & React.ComponentPropsWithoutRef<T>;

export default function Text<T extends ElementType = "p">({
  children,
  as,
  className,
  stl,
  ...rest
}: TextProps<T>) {
  const Component = as || "p";

  return (
    <Component className={className} style={stl} {...rest}>
      {children}
    </Component>
  );
}