import React from "react";
import clsx from "clsx";
import Text from "../ui/Text";
import Input from "../ui/Input";

type InputItem =
  | string
  | ({
      id?: string;
      label?: string;
      clearable?: boolean;
      onClear?: () => void;
    } & React.InputHTMLAttributes<HTMLInputElement>);

type FormProps = {
  label?: string;
  error?: string;
  className?: string;
  inputArr: InputItem[];
};

export default function LabelForm({
  label,
  error,
  className,
  inputArr,
}: FormProps) {
  return (
    <div className="w-full space-y-4">
      {label && (
        <Text as="h1" className="text-[1.5rem] text-gray-700">
          {label}
        </Text>
      )}

      {inputArr.map((item, index) => {
        if (typeof item === "string") {
          return (
            <Text key={index} as="label" className="text-sm text-gray-600">
              {item}
            </Text>
          );
        }

        const {
          label: itemLabel,
          clearable,
          onClear,
          className: inputClassName,
          ...inputProps
        } = item;

        const hasValue = typeof inputProps.value === "string" && inputProps.value.length > 0;
        const showClearButton = Boolean(clearable && hasValue && onClear);

        return (
          <div key={item.id ?? index} className="space-y-1">
            {itemLabel && (
              <Text
                as="label"
                htmlFor={item.id}
                className="block text-sm font-medium text-gray-700"
              >
                {itemLabel}
              </Text>
            )}

            <div className="relative">
              <Input
                {...inputProps}
                className={clsx(
                  "w-full px-4 py-2 rounded-lg border outline-none transition-all text-black placeholder:text-gray-400",
                  showClearButton && "pr-10",
                  error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500",
                  className,
                  inputClassName
                )}
              />

              {showClearButton && (
                <button
                  type="button"
                  onClick={onClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 hover:text-gray-600"
                  aria-label={`Clear ${itemLabel ?? inputProps.id ?? "input"}`}
                >
                  x
                </button>
              )}
            </div>

            {error && (
              <Text as="p" className="text-sm text-red-500">
                {error}
              </Text>
            )}
          </div>
        );
      })}
    </div>
  );
}
