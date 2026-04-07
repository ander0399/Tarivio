import { useState, useMemo } from "react";
import { Search, ChevronDown, Check, Globe } from "lucide-react";
import { COUNTRIES, getCountriesByRegion, REGION_ORDER } from "../config/countries";

export const CountrySearchSelect = ({ 
  value, 
  onChange, 
  placeholder = "Seleccionar país",
  label,
  required = false,
  error = false,
  testId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const countriesByRegion = getCountriesByRegion();
  
  // Filter countries based on search term
  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) {
      return countriesByRegion;
    }
    
    const term = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const filtered = {};
    
    REGION_ORDER.forEach(region => {
      const regionCountries = countriesByRegion[region];
      if (regionCountries) {
        const matches = regionCountries.filter(country => {
          const name = country.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const code = country.code.toLowerCase();
          return name.includes(term) || code.includes(term);
        });
        if (matches.length > 0) {
          filtered[region] = matches;
        }
      }
    });
    
    return filtered;
  }, [searchTerm, countriesByRegion]);
  
  const selectedCountry = COUNTRIES.find(c => c.code === value);
  
  const handleSelect = (countryCode) => {
    onChange(countryCode);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      {label && (
        <label className="label-cyber block mb-2 flex items-center gap-2">
          <Globe className="w-3 h-3" />
          {label}
          {required && <span className="text-red-400 text-[10px] ml-1">*</span>}
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-12 px-4 flex items-center justify-between rounded-lg border transition-all
          bg-[#0d1424] text-left
          ${error ? 'border-red-500/50' : 'border-cyan-500/20 hover:border-cyan-500/50'}
          ${isOpen ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : ''}
        `}
        data-testid={testId}
      >
        {selectedCountry ? (
          <span className="flex items-center gap-2">
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-white">{selectedCountry.name}</span>
            <span className="text-gray-500 text-sm">({selectedCountry.code})</span>
          </span>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setIsOpen(false);
              setSearchTerm("");
            }}
          />
          
          {/* Dropdown Content */}
          <div className="absolute z-50 w-full mt-1 bg-[#0d1424] border border-cyan-500/30 rounded-lg shadow-2xl max-h-[400px] overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-cyan-500/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar país..."
                  className="w-full h-10 pl-10 pr-4 bg-[#0a0f1a] border border-cyan-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  autoFocus
                  data-testid={`${testId}-search`}
                />
              </div>
            </div>
            
            {/* Countries List */}
            <div className="overflow-y-auto max-h-[320px] p-2">
              {Object.keys(filteredCountries).length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No se encontraron países
                </div>
              ) : (
                REGION_ORDER.map(region => {
                  const countries = filteredCountries[region];
                  if (!countries || countries.length === 0) return null;
                  
                  return (
                    <div key={region} className="mb-3">
                      <div className="text-cyan-400 text-xs uppercase tracking-wider px-2 py-1 font-semibold sticky top-0 bg-[#0d1424]">
                        {region} ({countries.length})
                      </div>
                      <div className="space-y-0.5">
                        {countries.map(country => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleSelect(country.code)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                              ${value === country.code 
                                ? 'bg-cyan-500/20 text-cyan-400' 
                                : 'text-white hover:bg-cyan-500/10'
                              }
                            `}
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="flex-1 text-left">{country.name}</span>
                            <span className="text-gray-500 text-xs">{country.code}</span>
                            {value === country.code && (
                              <Check className="w-4 h-4 text-cyan-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CountrySearchSelect;
