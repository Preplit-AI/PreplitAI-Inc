import { BrainCircuit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { chatModels } from "@/features/chat/models";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <BrainCircuit className="hidden h-4 w-4 text-gray-400 sm:block" aria-hidden="true" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label="Select AI model" className="h-9 w-[190px] rounded-full border-gray-200 bg-white px-4 text-xs shadow-sm focus:ring-[#B01232]/30">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent className="border-gray-200 bg-white">
          {chatModels.map((model) => (
            <SelectItem key={model.id} value={model.id} className="focus:bg-gray-100">
              <span className="font-medium">{model.name}</span>
              <span className="ml-2 text-xs text-gray-400">{model.provider}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
