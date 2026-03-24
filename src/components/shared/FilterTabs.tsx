interface FilterTab<T extends string> {
  id: T;
  label: string;
}

interface FilterTabsProps<T extends string> {
  tabs: Array<FilterTab<T>>;
  activeTab: T;
  getCount: (tabId: T) => number;
  onChange: (tabId: T) => void;
  fullWidth?: boolean;
}

export function FilterTabs<T extends string>({
  tabs,
  activeTab,
  getCount,
  onChange,
  fullWidth = false,
}: FilterTabsProps<T>) {
  return (
    <div className={`flex gap-2 ${fullWidth ? "" : "overflow-x-auto scrollbar-hide pb-1"}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = getCount(tab.id);

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
              whitespace-nowrap transition-all duration-150 active:scale-95 shrink-0
              ${fullWidth ? "flex-1 justify-center" : ""}
              ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600"
              }
            `}
          >
            {tab.label}
            {count > 0 && (
              <span
                className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                  isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}