"use client";

import { useState, useRef, useEffect } from "react";

export type Option = {
  value: string;
  label: string;
};

type Props = {
  options?: Option[];
  value?: string[];
  onChange?: (tokens: string[]) => void;
  placeholder?: string;
  className?: string;
};

export default function TokenAutoComplete({
  options = [],
  value = [],
  onChange,
  placeholder = "Search...",
  className = "",
}: Props) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ✅ close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ filter safely
  const filtered = options.filter(
    (opt) =>
      input &&
      opt.label.toLowerCase().includes(input.toLowerCase()) &&
      !value.includes(opt.label)
  );

  const addToken = (label: string) => {
    if (!value.includes(label)) {
      onChange?.([...value, label]);
    }
    setInput("");
    setOpen(false);
  };

  const removeToken = (label: string) => {
    onChange?.(value.filter((t) => t !== label));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filtered.length > 0) {
      addToken(filtered[0].label);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full overflow-visible ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2 border rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 bg-white">
        {value.map((token, index) => (
          <span
            key={`${token}-${index}`}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center gap-1"
          >
            {token}
            <button
              type="button"
              onClick={() => removeToken(token)}
              className="font-bold hover:text-red-500"
            >
              ×
            </button>
          </span>
        ))}

        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 outline-none min-w-[100px] text-sm bg-transparent"
        />
      </div>

      {/* ✅ DROPDOWN FIXED */}
      {open && filtered.length > 0 && (
        <ul className="absolute left-0 top-full mt-2 z-[9999] w-full bg-white border rounded-xl max-h-60 overflow-auto shadow-xl">
          {filtered.map((item, index) => (
            <li
              key={`${item.value}-${index}`}
              onClick={() => addToken(item.label)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}