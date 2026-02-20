import React, { Children } from "react";

type HorizontalContainerProps ={
  children: React.ReactNode;
  className?: string;
  stl?: React.CSSProperties;
} & React.HTMLAttributes<HTMLElement>;
export default function HorizontalContainer({children,className,stl,...props}:HorizontalContainerProps) {
    return(
        <div className={`flex flex-row ${className}`} style={stl}  {...props}>
            {children}
        </div>
    )
};
