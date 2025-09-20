"use client";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  count: number;
  color: 'blue' | 'green' | 'red' | 'gray';
  children: React.ReactNode;
}

export default function TabButton({ active, onClick, count, color, children }: TabButtonProps) {
  const colorClasses = {
    blue: active ? 'bg-blue-600 text-white' : 'text-blue-600',
    green: active ? 'bg-green-600 text-white' : 'text-green-600',
    red: active ? 'bg-red-600 text-white' : 'text-red-600',
    gray: active ? 'bg-gray-600 text-white' : 'text-gray-600'
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors ${
        active ? colorClasses[color] : 'text-gray-600 hover:bg-white'
      }`}
    >
      {children}
      <span className={`px-2 py-1 rounded-full text-xs ${
        active ? 'bg-white bg-opacity-20' : `bg-${color}-100`
      }`}>
        {count}
      </span>
    </button>
  );
}
