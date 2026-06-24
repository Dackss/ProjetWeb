import { useState, useRef, useEffect } from "react";

export function Selectdepartement() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");

  // On utilise une "ref" pour savoir où est le menu déroulant dans la page
  const menuRef = useRef(null);

  const depts = [
    "Menu Item 1",
    "Menu Item 2",
    "Menu Item 3",
    "Menu Item 4",
    "Menu Item 5",
    "Menu Item 6",
  ];

  const handleSelect = (value) => {
    setSelectedValue(value);
    setIsOpen(false);
  };

  // Ferme le menu si on clique n'importe où en dehors de celui-ci
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative inline-block w-64 text-left">
      {/* L'input qui sert de déclencheur */}
      <input
        type="text"
        readOnly
        placeholder="Choisir un département..."
        value={selectedValue}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
      />

      {/* La liste déroulante */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto z-50">
          <ul className="py-1 text-gray-700">
            {depts.map((dept, index) => (
              <li
                key={index}
                onClick={() => handleSelect(dept)}
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors ${
                  selectedValue === dept
                    ? "bg-blue-50 font-medium text-blue-600"
                    : ""
                }`}
              >
                {dept}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
