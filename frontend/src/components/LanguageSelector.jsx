import { Globe } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const LanguageSelector = ({ className = "" }) => {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="w-4 h-4 text-gray-400" />
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger 
          className="w-[130px] h-9 bg-[#0d1424] border-cyan-500/20 text-sm" 
          data-testid="language-selector"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#0d1424] border-cyan-500/30">
          {supportedLanguages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="text-white hover:bg-cyan-500/10 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
