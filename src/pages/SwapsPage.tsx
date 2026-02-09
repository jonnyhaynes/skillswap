import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useSwaps } from '@/hooks/useSwaps';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { SwapCard } from '@/components/swaps/SwapCard';

export function SwapsPage() {
  const { currentUser, fetchUsersByIds, getUserById } = useAuth();
  const { getIncomingSwaps, getOutgoingSwaps, getActiveSwaps, getCompletedSwaps } = useSwaps();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('incoming');
  const fetchedIdsRef = useRef<Set<string>>(new Set());

  const incoming = useMemo(
    () => (currentUser ? getIncomingSwaps(currentUser.id) : []),
    [currentUser, getIncomingSwaps]
  );
  const outgoing = useMemo(
    () => (currentUser ? getOutgoingSwaps(currentUser.id) : []),
    [currentUser, getOutgoingSwaps]
  );
  const active = useMemo(
    () => (currentUser ? getActiveSwaps(currentUser.id) : []),
    [currentUser, getActiveSwaps]
  );
  const completed = useMemo(
    () => (currentUser ? getCompletedSwaps(currentUser.id) : []),
    [currentUser, getCompletedSwaps]
  );

  const missingUserIds = useMemo(() => {
    if (!currentUser) return [];
    const allSwaps = [...incoming, ...outgoing, ...active, ...completed];
    const ids = new Set(allSwaps.flatMap((s) => [s.proposerId, s.recipientId]));
    return [...ids].filter(
      (id) => id !== currentUser.id && !getUserById(id) && !fetchedIdsRef.current.has(id)
    );
  }, [incoming, outgoing, active, completed, currentUser, getUserById]);

  useEffect(() => {
    if (missingUserIds.length > 0) {
      missingUserIds.forEach((id) => fetchedIdsRef.current.add(id));
      fetchUsersByIds(missingUserIds);
    }
  }, [missingUserIds, fetchUsersByIds]);

  if (!currentUser) return null;

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
      <div className="flex flex-col space-y-3">
        {swaps.map((swap) => (
          <SwapCard key={swap.id} swap={swap} currentUserId={currentUser.id} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">My Swaps</h1>
        <p className="text-slate-500 mt-1">Track your skill exchange proposals and progress</p>
      </div>

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
