"use client";

import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      // split by common delimiters but for now let's just use comma or newlines as it was stored before
      const parsed = value.split(/,|\n/).map(item => item.trim()).filter(Boolean);
      setTags(parsed);
    } else {
      setTags([]);
    }
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      onChange(newTags.join(", "));
      setInputValue("");
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag();
    }
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(newTags.join(", "));
  };

  const handleContainerClick = () => {
    const input = containerRef.current?.querySelector("input");
    if (input) input.focus();
  };

  return (
    <div 
        ref={containerRef}
        onClick={handleContainerClick}
        className="flex flex-wrap items-center gap-2 min-h-[44px] rounded-lg border border-border/50 bg-background/50 p-2 transition-colors focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary cursor-text"
    >
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-medium border border-primary/20 shadow-sm"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
            }}
            className="text-primary/60 hover:text-primary transition-colors focus:outline-none bg-primary/10 rounded-full p-0.5 ml-1"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none px-2 py-1 placeholder:text-muted-foreground/50 text-foreground"
        placeholder={tags.length === 0 ? placeholder : "Add more..."}
      />
    </div>
  );
}
