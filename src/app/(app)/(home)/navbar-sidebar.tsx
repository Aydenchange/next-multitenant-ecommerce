import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Link from "next/link";

interface NavbarItem {
  href: string;
  children: React.ReactNode;
}

interface Props {
  items: NavbarItem[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function NavbarSidebar({ items, isOpen, onOpenChange }: Props) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 transition-none">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <ScrollArea className=" overflow-y-auto h-full pb-2">
          <div className="flex flex-col ">
            {items.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                onClick={() => onOpenChange(false)}
                className="w-full text-left p-4 hover:bg-black hover:text-white  items-center text-base font-medium"
              >
                {item.children}
              </Link>
            ))}
          </div>

          <div className="border-t flex flex-col ">
            <Link
              href="#"
              onClick={() => onOpenChange(false)}
              className="w-full text-left p-4 hover:bg-black hover:text-white  items-center text-base font-medium"
            >
              Sign In
            </Link>

            <Link
              href="#"
              onClick={() => onOpenChange(false)}
              className="w-full text-left p-4 hover:bg-black hover:text-white  items-center text-base font-medium"
            >
              Start Selling
            </Link>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
