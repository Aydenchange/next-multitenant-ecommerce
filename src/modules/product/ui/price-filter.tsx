import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PriceFilter = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <Label className="font-medium text-base">Minimum price</Label>
        <Input type="text" placeholder="$0" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="font-medium text-base">Maximum price</Label>
        <Input
          type="text"
          placeholder="∞" // Infinity sign
        />
      </div>
    </div>
  );
};

export default PriceFilter;
