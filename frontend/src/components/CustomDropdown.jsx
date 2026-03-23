import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (value) {
      const selectedOption = options.find(option => option.value === value || option === value);
      return selectedOption ? (selectedOption.label || selectedOption) : placeholder;
    }
    return placeholder;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        className={`
          w-full px-4 py-2.5 border border-purple-100 rounded-lg 
          focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
          text-sm flex items-center justify-between cursor-pointer
          hover:border-purple-300 transition-all duration-200
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`truncate ${!value ? 'text-gray-400' : 'text-gray-700'}`} title={getDisplayText()}>
          {getDisplayText()}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {isOpen && (
        <div className="
          absolute z-10 mt-1 w-full bg-white border border-purple-100 
          rounded-lg shadow-lg py-1 max-h-60 overflow-auto
          animate-fadeIn
        ">
          {options.map((option, index) => {
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            
            return (
              <div
                key={index}
                className={`
                  px-4 py-2 text-sm cursor-pointer transition-colors duration-150
                  ${value === optionValue 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-700 hover:bg-purple-50'
                  }
                `}
                onClick={() => handleSelect(optionValue)}
                title={optionLabel}
              >
                <span className="dropdown-text-truncate">{optionLabel}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;