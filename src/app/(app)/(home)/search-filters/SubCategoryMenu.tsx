export default function SubCategoryMenu({
  isOpen,
  subcategories,
}: {
  isOpen: boolean;
  subcategories: any;
}) {
  if (!isOpen) {
    return null;
  }
  return (
    <div>
      {subcategories.map((sub: any) => (
        <div key={sub.id}>{sub.name}</div>
      ))}
    </div>
  );
}
