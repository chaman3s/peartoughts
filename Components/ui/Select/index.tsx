"use client";

import React from "react";

export type SelectOption = {
  id?: string; // optional but recommended
  value: string;
  label: string;
  className?: string;
  fun?:()=>void
};

type SelectProps = {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

export default function Select({
  options,
  value,
  defaultValue,
  name,
  className = "",
  placeholder,
  disabled,
  onChange,
}: SelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <select
      name={name}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      onChange={handleChange}
      className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {/* ✅ placeholder */}
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}

      {/* ✅ options with guaranteed unique key */}
      {options.map((opt, index) => (
        <option
          key={opt.id ?? `${opt.value}-${index}`}
          value={opt.value}
          className={opt.className}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}