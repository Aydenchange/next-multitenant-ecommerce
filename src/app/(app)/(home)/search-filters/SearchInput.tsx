import { SearchIcon } from "lucide-react";

export default function SearchInput() {
  return (
    <div>
      <SearchIcon />
      <input
        type="text"
        placeholder="Search..."
        className="border p-2 rounded"
      />
    </div>
  );
}
