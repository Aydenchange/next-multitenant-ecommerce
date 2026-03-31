import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export default function SearchInput() {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
        <Input
          type="text"
          placeholder="Search Products..."
          className=" pl-10"
        />
      </div>
    </div>
  );
}
