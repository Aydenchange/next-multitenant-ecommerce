import Link from "next/link";

export default function SubCategoryMenu({
  isOpen,
  subcategories,
  color,
}: {
  isOpen: boolean;
  subcategories: Array<{ id: string; name: string }>;
  color?: string;
}) {
  if (!isOpen) {
    return null;
  }
  return (
    <div
      className="absolute left-0 top-full  min-w-40 rounded-md p-2 shadow-md z-50"
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
