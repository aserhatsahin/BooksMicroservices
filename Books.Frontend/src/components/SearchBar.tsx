import { SearchIcon } from './Icons';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = 'Search...' }: SearchBarProps) => (
  <div className="relative w-full max-w-xs">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 [&>svg]:w-4 [&>svg]:h-4 pointer-events-none">
      <SearchIcon />
    </span>
    <input
      type="text"
      className="input input-bordered w-full pl-9 h-9 text-sm rounded-xl bg-base-100"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
