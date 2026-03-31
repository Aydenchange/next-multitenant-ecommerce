import Link from "next/link";

export default function SubCategoryMenu({
  subcategories,
  color,
}: {
  subcategories: Array<{ id: string; name: string }>;
  color?: string;
}) {
  return (
    <div
      className="absolute left-0 top-full z-50  min-w-full w-max rounded-md p-2 shadow-md"
      style={{ backgroundColor: color }}
    >
      {subcategories.map((sub) => (
        <Link
          key={sub.id}
          href="/"
          className="w-full text-left p-4 hover:bg-black hover:text-white flex justify-between items-center underline font-medium"
        >
          {sub.name}
        </Link>
      ))}
    </div>
  );
}
