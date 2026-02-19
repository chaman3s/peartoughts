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
type TextProps = {
  as?: ElementType;
  children: React.ReactNode;
  className?: string;
  stl?: React.CSSProperties;
} & React.HTMLAttributes<HTMLElement>;;
export default function Text({children,as="p",className ,stl}:TextProps) {
     const Component = as;
     return (
        <Component className={className} style={stl}>
            {children}
        </Component>
     )
};
