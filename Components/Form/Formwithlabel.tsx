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

export default function Form({
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
        // If item is a simple string
        if (typeof item === "string") {
          return (
            <Text key={index} as="label" className="text-sm text-gray-600">
              {item}
            </Text>
          );
        }

        // If item is input object
        return (
          <div key={item.id ?? index} className="animate-fadeInUp space-y-1">
            {item.label && (
              <Text
                as="label"
                htmlFor={item.id}
                className="block text-sm font-medium text-gray-700"
              >
                {item.label}
              </Text>
            )}

            <Input
              {...item}
              className={clsx(
                "w-full px-4 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base border outline-none transition-all duration-300",
                "focus:ring-2 focus:ring-blue-500",
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 hover:border-gray-400",
                className,
                item.className
              )}
            />

            {error && (
              <Text as="p" className="text-xs sm:text-sm text-red-500">
                {error}
              </Text>
            )}
          </div>
        );
      })}
    </div>
  );
}