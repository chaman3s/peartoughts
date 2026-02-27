"use client";
import { useState } from "react";

type Option = {
  value: string;
  label: string;
};

type AutoCompleteProps = {
  options: Option[];
  placeholder?: string;
  onSelect?: (value: string) => void;
};

export default function AutoComplete({
  options,
  placeholder = "Search...",
  onSelect,
}: AutoCompleteProps) {
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState(false);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (value: string, label: string) => {
    setQuery(label);
    setOpen(false);
    onSelect?.(value);
  };

  return (
    <div className="relative w-80">
      <input
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full border rounded-lg px-4 py-2 outline-none"
      />

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
          {filtered.map((item) => (
            <li
              key={item.value}
              onClick={() => handleSelect(item.value, item.label)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}