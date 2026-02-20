import NextImage, { ImageProps } from "next/image";
import clsx from "clsx";

type Props = ImageProps & {
  rounded?: boolean;
  
};

export default function Image({
  className,
  rounded = false,
  ...props
}: Props) {
  return (
    <NextImage
      className={clsx(
        rounded && "rounded-full",
        className
      )}
      {...props}
    />
  );
}
