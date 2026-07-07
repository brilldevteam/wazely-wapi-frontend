"use client";

import { COUNTRIES } from "@/src/data/Countries";
import { Button } from "@/src/elements/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/src/elements/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/elements/ui/popover";
import { cn } from "@/src/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import React from "react";

type CountryCodeSelectProps = {
  value?: string;
  onChange: (dialCode: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
};

const countryFlag = (code: string) => {
  if (!code || code.length !== 2) return "";
  return String.fromCodePoint(...code.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)));
};

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({ value, onChange, disabled, placeholder = "Code", className, triggerClassName }) => {
  const [open, setOpen] = React.useState(false);
  const selectedCountry = value ? COUNTRIES.find((country) => country.dial_code === value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-expanded={open}
          className={cn(
            "h-11 w-full justify-between gap-2 rounded-lg border border-(--input-border-color) bg-slate-50/30 px-3 text-sm font-medium text-slate-700 shadow-none transition-all hover:bg-slate-50 dark:border-(--card-border-color) dark:bg-(--page-body-bg) dark:text-slate-200",
            triggerClassName
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selectedCountry ? (
              <>
                <span className="text-base leading-none">{countryFlag(selectedCountry.code)}</span>
                <span className="truncate">{selectedCountry.dial_code}</span>
              </>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-(--input-border-color) p-0 shadow-2xl dark:border-(--card-border-color) dark:bg-(--card-color)", className)}>
        <Command>
          <CommandInput placeholder="Search country or code..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => {
                const isSelected = country.code === selectedCountry?.code;
                return (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.dial_code} ${country.code}`}
                    onSelect={() => {
                      onChange(country.dial_code);
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 data-[selected=true]:bg-primary/10"
                  >
                    <span className="w-6 text-base leading-none">{countryFlag(country.code)}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-200">{country.name}</span>
                    <span className="shrink-0 text-sm font-medium text-slate-400">{country.dial_code}</span>
                    <Check className={cn("h-4 w-4 shrink-0 text-primary", isSelected ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
