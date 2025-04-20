import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface SearchOption {
  value: string
  label: string
}

interface SearchComboboxProps {
  options: SearchOption[]
  value?: string
  onValueChange: (value: string) => void
  onInputChange?: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  loading?: boolean
}

export function SearchCombobox({
  options,
  value,
  onValueChange,
  onInputChange,
  onSubmit,
  placeholder = "Enter city name",
  emptyMessage = "No cities found",
  loading = false,
}: SearchComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleInputChange = (value: string) => {
    setInputValue(value)
    onInputChange?.(value)
    if (!open && value.length >= 1) {
      setOpen(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.length >= 2) {
      onSubmit?.(inputValue)
    }
  }

  const handleSearchClick = () => {
    if (inputValue.length >= 2) {
      onSubmit?.(inputValue)
    }
  }

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? options.find((option) => option.value === value)?.label
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <CommandInput 
                placeholder={placeholder} 
                value={inputValue}
                onValueChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearchClick}
                className="h-8 w-8"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {loading ? (
              <CommandEmpty>Loading...</CommandEmpty>
            ) : options.length === 0 && inputValue.length >= 2 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue)
                      setInputValue("")
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}