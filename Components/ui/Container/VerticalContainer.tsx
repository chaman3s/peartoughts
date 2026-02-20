import React, { Children } from "react";

type VerticalContainerProps ={
  children: React.ReactNode;
  className?: string;
  stl?: React.CSSProperties;
} & React.HTMLAttributes<HTMLElement>;
export default function VerticalContainer({children,className,stl,...props}:VerticalContainerProps) {
    return(
        <div className={`flex flex-col ${className}`} style={stl}  {...props}>
            {children}
        </div>
    )
};
