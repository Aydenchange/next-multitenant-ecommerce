import CategroyDropdown from "./CategroyDropdown";

export default function Categories({
  data,
}: Readonly<{
  data: any;
}>) {
  return (
    <div className="flex flex-nowrap items-center gap-2 ">
      {data.map((item: any) => (
        <CategroyDropdown key={item.id} category={item} />
      ))}
    </div>
  );
}
