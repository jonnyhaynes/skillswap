import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useSwaps } from '@/hooks/useSwaps';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { SwapCard } from '@/components/swaps/SwapCard';

export function SwapsPage() {
  const { currentUser } = useAuth();
  const { getIncomingSwaps, getOutgoingSwaps, getActiveSwaps, getCompletedSwaps } = useSwaps();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('incoming');

  if (!currentUser) return null;

  const incoming = getIncomingSwaps(currentUser.id);
  const outgoing = getOutgoingSwaps(currentUser.id);
  const active = getActiveSwaps(currentUser.id);
  const completed = getCompletedSwaps(currentUser.id);

  const tabs = [
    { id: 'incoming', label: 'Incoming', count: incoming.length },
    { id: 'outgoing', label: 'Outgoing', count: outgoing.length },
    { id: 'active', label: 'Active', count: active.length },
    { id: 'completed', label: 'Completed', count: completed.length },
  ];

  const renderSwapList = (swaps: typeof incoming, emptyTitle: string, emptyDescription: string) => {
    if (swaps.length === 0) {
      return (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
          }
          title={emptyTitle}
          description={emptyDescription}
          action={{
            label: 'Browse Skills',
            onClick: () => navigate('/browse'),
          }}
        />
      );
    }

    return (
      <div className="space-y-3">
        {swaps.map((swap) => (
          <SwapCard key={swap.id} swap={swap} currentUserId={currentUser.id} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">My Swaps</h1>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === 'incoming' &&
          renderSwapList(
            incoming,
            'No incoming proposals',
            "You don't have any pending swap proposals from other users yet."
          )}
        {activeTab === 'outgoing' &&
          renderSwapList(
            outgoing,
            'No outgoing proposals',
            "You haven't sent any swap proposals that are still pending."
          )}
        {activeTab === 'active' &&
          renderSwapList(
            active,
            'No active swaps',
            "You don't have any swaps in progress. Browse skills and propose a swap to get started!"
          )}
        {activeTab === 'completed' &&
          renderSwapList(
            completed,
            'No completed swaps',
            "You haven't completed any swaps yet. Once a swap is finished, it will appear here."
          )}
      </div>
    </div>
  );
}
