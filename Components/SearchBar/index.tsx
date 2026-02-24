import Button from "@/Components/ui/Button";
import Input from "../ui/Input";
import React from "react";

type SearchProps = {
  inputProps?: React.ComponentProps<"input">;
  inputValue?: string;
  plaHor?: string;
  inputClass?: string;
  btnClass?: string;
  children?: React.ReactNode;
} & React.ComponentProps<"div">;

export default function SearchBar({
  inputProps,
  inputValue,
  plaHor,
  inputClass,
  btnClass,
  children,
  className,
  ...divProps
}: SearchProps) {
  return (
    <div
      className={`flex w-full overflow-hidden rounded-full border border-slate-300 bg-slate-50 ${className ?? ""}`}
      {...divProps}
    >
      <Input
        type="text"
        value={inputValue}
        placeholder={plaHor}
        className={inputClass}
        {...inputProps}
      />

      <Button className={btnClass}>Search</Button>

      {children}
    </div>
  );
}