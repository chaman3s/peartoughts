import clsx from "clsx";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  rounded?: boolean;
};

export default function Input({
  className,
  rounded,
  ...props
}: InputProps) {
  return (
    <input
      className={clsx(
        rounded && "rounded-full",
        className
      )}
      {...props}
    />
  );
}