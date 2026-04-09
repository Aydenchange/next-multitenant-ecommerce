import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Link from "next/link";
import { CategoryNavItem, toCategoryHref } from "./types";

export default function CategoriesSidebar({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CategoryNavItem[];
}) {
  return (
    <div>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 transition-none">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>All Categories</SheetTitle>
          </SheetHeader>
          <ScrollArea className=" overflow-y-auto h-full pb-2">
            <div className="flex flex-col ">
              {data.map((item: CategoryNavItem) => (
                <Link
                  href={toCategoryHref(item.slug)}
                  key={item.id}
                  onClick={() => onOpenChange(false)}
                  className="w-full text-left p-4 hover:bg-black hover:text-white  items-center text-base font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
