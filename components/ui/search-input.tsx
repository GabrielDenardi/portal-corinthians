import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

interface SearchInputProps {
  className?: string;
  placeholder?: string;
}

export function SearchInput({
  className,
  placeholder = "Buscar notícias, jogos e temas",
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <label className="sr-only" htmlFor="portal-search">
        Buscar no portal
      </label>
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
      <input
        id="portal-search"
        type="search"
        placeholder={placeholder}
        className="type-body-sm h-12 w-full rounded-[var(--radius-full)] border border-line bg-white/4 pl-11 pr-4 text-ink placeholder:text-ink-muted focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
      />
    </div>
  );
}
