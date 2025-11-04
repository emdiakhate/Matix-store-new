'use client';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
  color?: string;
}

export default function TabButton({ active, onClick, children, count, color }: TabButtonProps) {
  const getColorClasses = (colorName?: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      gray: 'bg-gray-100 text-gray-600',
    };
    return colorName ? colors[colorName] || colors.gray : 'bg-gray-100 text-gray-600';
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
        active
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:bg-opacity-50'
      }`}
    >
      <span className="flex items-center gap-2">
        {children}
        {count !== undefined && (
          <span className={`px-2 py-0.5 text-xs rounded-full ${getColorClasses(color)}`}>
            {count}
          </span>
        )}
      </span>
    </button>
  );
}
