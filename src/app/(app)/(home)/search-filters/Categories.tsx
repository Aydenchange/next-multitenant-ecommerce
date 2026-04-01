"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import CategroyDropdown from "./CategroyDropdown";
import { ListFilterIcon } from "lucide-react";
import CategoriesSidebar from "./CategoriesSidebar";
import { CategoryNavItem } from "./types";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const GAP = 8; // gap-2 = 8px

export default function Categories({
  data,
}: Readonly<{
  data: CategoryNavItem[];
}>) {
  const outerRef = useRef<HTMLDivElement>(null); // watches for resize
  const innerRef = useRef<HTMLDivElement>(null); // hidden layer for measuring
  const viewRef = useRef<HTMLDivElement>(null); // "View All" button
  const [visibleCount, setVisibleCount] = useState<number>(data.length);
  const [openSidebar, setOpenSidebar] = useState(false);

  const trpc = useTRPC();
  const { data: helloData } = useQuery(
    trpc.hello.queryOptions({ text: "world" }),
  );
  console.log(helloData);

  const recalculate = useCallback(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    const view = viewRef.current;
    if (!outer || !inner || !view) return;

    const viewStyles = window.getComputedStyle(view);
    const viewReservedWidth =
      view.offsetWidth + Number.parseFloat(viewStyles.marginLeft || "0");

    // Available width after reserving room for the "View All" button
    const available = outer.clientWidth - viewReservedWidth;

    let total = 0;
    let count = 0;
    for (const item of Array.from(inner.children) as HTMLElement[]) {
      total += item.offsetWidth + GAP;
      if (total > available) break;
      count++;
    }

    setVisibleCount(count);
  }, []);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(recalculate);
    observer.observe(el);

    const frameId = requestAnimationFrame(recalculate);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [recalculate]);

  return (
    <div ref={outerRef} className="flex items-center gap-2 w-full ">
      <CategoriesSidebar
        open={openSidebar}
        onOpenChange={setOpenSidebar}
        data={data}
      />
      {/* Hidden measurement layer — all items rendered but invisible */}
      <div
        ref={innerRef}
        aria-hidden="true"
        className="flex items-center gap-2 absolute invisible pointer-events-none"
      >
        {data.map((item) => (
          <div key={item.id} className="inline-block shrink-0">
            <Button
              variant="elevated"
              className="pointer-events-none transition-none hover:translate-x-0 hover:translate-y-0 hover:shadow-none"
            >
              {item.name}
            </Button>
          </div>
        ))}
      </div>

      {/* Visible layer — only the first visibleCount items */}
      <div className=" flex flex-nowrap items-center gap-2 min-w-0 ">
        {data.slice(0, visibleCount).map((item) => (
          <CategroyDropdown key={item.id} category={item} />
        ))}
      </div>

      {/* View All button — never shrinks, always stays on the right */}
      <div ref={viewRef} className=" shrink-0 ">
        <Button onClick={() => setOpenSidebar(true)}>
          View All
          <ListFilterIcon />
        </Button>
      </div>
    </div>
  );
}
