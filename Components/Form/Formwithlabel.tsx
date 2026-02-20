import React from "react";
import clsx from "clsx";
import Text from "../ui/Text";
import Input from "../ui/Input";

type InputItem =
  | string
  | ({
      id?: string;
      label?: string;
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
          className: inputClassName,
          ...inputProps
        } = item;

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

            <Input
              {...inputProps}
              className={clsx(
                "w-full px-4 py-2 rounded-lg border outline-none transition-all",
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500",
                className,
                inputClassName
              )}
            />

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