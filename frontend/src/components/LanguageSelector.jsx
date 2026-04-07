import { useState } from "react";
import { Globe, Search, Check } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

export const LanguageSelector = ({ className = "" }) => {
  const { language, setLanguage, supportedLanguages, currentLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Filter languages by search
  const filteredLanguages = supportedLanguages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(search.toLowerCase()) ||
      lang.code.toLowerCase().includes(search.toLowerCase())
  );

  // Group languages by region
  const groupedLanguages = filteredLanguages.reduce((acc, lang) => {
    const region = lang.region || "Other";
    if (!acc[region]) acc[region] = [];
    acc[region].push(lang);
    return acc;
  }, {});

  const handleSelect = (code) => {
    setLanguage(code);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 px-3 bg-[#0d1424] border border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-500/40"
            data-testid="language-selector"
          >
            <Globe className="w-4 h-4 text-gray-400 mr-2" />
            <span className="mr-1">{currentLanguage?.flag}</span>
            <span className="text-sm text-gray-300">{currentLanguage?.name}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-72 p-0 bg-[#0d1424] border-cyan-500/30" 
          align="end"
        >
          {/* Search */}
          <div className="p-3 border-b border-cyan-500/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search language..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-[#0a0f1a] border-cyan-500/20 text-sm"
              />
            </div>
          </div>

          {/* Languages List */}
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {Object.entries(groupedLanguages).map(([region, langs]) => (
                <div key={region} className="mb-3">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {region}
                  </div>
                  {langs.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleSelect(lang.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors
                        ${language === lang.code 
                          ? "bg-cyan-500/20 text-cyan-400" 
                          : "text-gray-300 hover:bg-cyan-500/10 hover:text-white"
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                      {language === lang.code && (
                        <Check className="w-4 h-4 text-cyan-400" />
                      )}
                    </button>
                  ))}
                </div>
              ))}
              
              {filteredLanguages.length === 0 && (
                <div className="px-3 py-6 text-center text-gray-500 text-sm">
                  No languages found
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LanguageSelector;
