import { cn } from '@/utils/cn';

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-slate-200/60" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
          id={`tab-${tab.id}`}
          className={cn(
            'px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-200',
            activeTab === tab.id
              ? 'border-primary-500 text-primary-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-600'
                  : 'bg-slate-100 text-slate-600'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
