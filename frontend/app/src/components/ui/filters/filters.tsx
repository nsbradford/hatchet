import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useFilters } from '@/hooks/use-filters';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface FiltersProps {
  children?: React.ReactNode;
  className?: string;
}

interface FilterBuilderProps<T> {
  name: keyof T;
  placeholder?: string;
  className?: string;
}

export function FilterGroup({ className, children, ...props }: FiltersProps) {
  return (
    <div
      role="filters"
      aria-label="filters"
      className={cn('flex w-full items-center gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface TextFilterProps<T> extends FilterBuilderProps<T> {
  value?: string;
}

export function FilterText<T>({
  name,
  placeholder,
  className,
}: TextFilterProps<T>) {
  const { filters, setFilter } = useFilters<T>();
  const value = filters[name];

  return (
    <Input
      type="text"
      value={value as string}
      onChange={(e) =>
        setFilter(
          name,
          e.target.value
            ? (e.target.value as T[keyof T])
            : (undefined as T[keyof T]),
        )
      }
      placeholder={placeholder}
      className={cn('w-full', className)}
    />
  );
}

type ArrayElement<T> = T extends (infer U)[] ? U : T;

interface MultiSelectFilterProps<T, A, Key extends keyof T = keyof T>
  extends FilterBuilderProps<T> {
  multi?: boolean;
  name: Key;
  only?: boolean;
  options: {
    label: React.ReactNode;
    value: ArrayElement<A>;
    text?: string;
  }[];
  value?: A;
}

export function FilterSelect<T, A>({
  name,
  options,
  placeholder,
  multi = false,
  only = false,
}: MultiSelectFilterProps<T, A>) {
  const { filters, setFilter } = useFilters<T>();
  const value = filters[name] as Array<ArrayElement<A>> | undefined;
  const [open, setOpen] = React.useState(false);

  const handleSelect = (optionValue: ArrayElement<A>) => {
    if (value?.includes(optionValue)) {
      setFilter(
        name,
        multi
          ? (value.filter((v) => v !== optionValue) as unknown as T[keyof T])
          : (optionValue as T[keyof T]),
      );
    } else {
      setFilter(
        name,
        multi
          ? ([...(value || []), optionValue] as unknown as T[keyof T])
          : (optionValue as T[keyof T]),
      );
    }
  };

  const selectedOptions = multi
    ? value?.map((v) => options.find((o) => o.value === v)).filter(Boolean) ||
      []
    : value
      ? [options.find((o) => o.value === value)]
      : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex flex-wrap gap-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option, index) => (
                <Badge key={index} variant="secondary" className="mr-1">
                  {option?.label}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {options.map((option, index) => (
              <CommandItem
                key={index}
                onSelect={() => {
                  handleSelect(option.value);
                }}
                className="group"
              >
                <div className="flex items-center space-x-2 justify-between">
                  <div
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                      value?.includes(option.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50 [&_svg]:invisible',
                    )}
                  >
                    {multi && <Check className="h-4 w-4" />}
                  </div>
                  <span>{option.text || option.label}</span>
                </div>

                {multi && only && (
                  <Badge
                    variant="outline"
                    className="ml-auto opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilter(name, [option.value] as T[keyof T]);
                    }}
                  >
                    Only
                  </Badge>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
