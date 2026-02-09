import { cn } from '@/utils/cn';

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-slate-200/80">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200',
            activeTab === tab.id
              ? 'border-primary-500 text-primary-700'
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-600'
                  : 'bg-slate-50 text-slate-400'
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
