import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select } from 'antd';
import {
  Vote,
  Users,
  MessageSquare,
  Search,
  CheckCircle2,
  Lock,
  Calendar,
  Inbox,
} from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import { useGetProgrammesQuery } from '@/store/api/programmesApi';
import {
  useGetProggramAnalyticsQuery,
  useGetPollsByProgramQuery,
  useGetPollAnswerByProgramQuery,
  useGetUserThoughtsQuery,
  type ProgrammePoll,
  type PollAnswer,
  type UserThought,
} from '@/store/api/organizationApi/audienceEngagementApi';

export default function AudienceEngagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: programmesData, isLoading: isProgrammesLoading } = useGetProgrammesQuery();
  const programmes = programmesData || [];

  const [programmeId, setProgrammeId] = useState<string>('');

  // Active tab bound to URL parameter ?tab=poll-results | ?tab=audience-thoughts
  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab');
    if (tab === 'audience-thoughts') return 'audience-thoughts';
    return 'poll-results';
  }, [searchParams]);

  const handleTabChange = (newTab: 'poll-results' | 'audience-thoughts') => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', newTab);
        return next;
      },
      { replace: true }
    );
  };

  const [selectedPollId, setSelectedPollId] = useState<string>('');
  const [thoughtsFilter] = useState<'all' | 'read' | 'unread' | 'archived'>('all');
  const [thoughtsSearch, setThoughtsSearch] = useState<string>('');

  // Local state for toggling read / archived status on client side if needed
  const [localThoughtsState] = useState<Record<string, { is_read?: boolean; is_archived?: boolean }>>({});

  // Auto-select first programme when available
  useEffect(() => {
    if (programmes.length > 0 && (!programmeId || !programmes.some((p) => p.id === programmeId))) {
      setProgrammeId(programmes[0].id);
    }
  }, [programmes, programmeId]);

  const programmeOptions = useMemo(() => {
    return programmes.map((p) => ({ label: p.title, value: p.id }));
  }, [programmes]);

  const activeProgrammeTitle = useMemo(() => {
    const found = programmes.find((p) => p.id === programmeId);
    return found?.title || 'Selected Programme';
  }, [programmes, programmeId]);

  // Queries (only run when a valid programmeId is selected)
  const skipQuery = !programmeId;

  const { data: analyticsRes, isLoading: isAnalyticsLoading } = useGetProggramAnalyticsQuery(
    programmeId,
    { skip: skipQuery }
  );

  const { data: pollsRes, isLoading: isPollsLoading } = useGetPollsByProgramQuery(
    programmeId,
    { skip: skipQuery }
  );

  // Polls list from API
  const polls: ProgrammePoll[] = useMemo(() => {
    return pollsRes?.data || [];
  }, [pollsRes]);

  // Auto-select first poll in list when polls change
  useEffect(() => {
    if (polls.length > 0) {
      const exists = polls.some((p) => p._id === selectedPollId || p.id === selectedPollId);
      if (!selectedPollId || !exists) {
        setSelectedPollId(polls[0]._id || polls[0].id);
      }
    } else {
      setSelectedPollId('');
    }
  }, [polls, selectedPollId]);

  const activePoll = useMemo(() => {
    if (!polls.length) return null;
    return polls.find((p) => p._id === selectedPollId || p.id === selectedPollId) || polls[0];
  }, [polls, selectedPollId]);

  // Poll Answers query from API
  const pollAnswerQueryId = activePoll?._id || activePoll?.id || '';
  const skipPollAnswers = !pollAnswerQueryId;

  const { data: pollAnswersRes, isLoading: isPollAnswersLoading } = useGetPollAnswerByProgramQuery(
    pollAnswerQueryId,
    { skip: skipPollAnswers }
  );

  const pollAnswers: PollAnswer[] = useMemo(() => {
    return pollAnswersRes?.data || [];
  }, [pollAnswersRes]);

  // User Thoughts Query from API
  const { data: thoughtsRes, isLoading: isThoughtsLoading } = useGetUserThoughtsQuery(
    {
      programme: programmeId,
      status: thoughtsFilter,
      searchTerm: thoughtsSearch,
      limit: 50,
    },
    { skip: skipQuery }
  );

  const rawThoughts: UserThought[] = useMemo(() => {
    return thoughtsRes?.data || [];
  }, [thoughtsRes]);

  // Apply client-side local overrides & filters
  const thoughts = useMemo(() => {
    return rawThoughts
      .map((t) => ({
        ...t,
        is_read: localThoughtsState[t._id]?.is_read ?? t.is_read,
        is_archived: localThoughtsState[t._id]?.is_archived ?? t.is_archived,
      }))
      .filter((t) => {
        if (thoughtsFilter === 'read') return t.is_read && !t.is_archived;
        if (thoughtsFilter === 'unread') return !t.is_read && !t.is_archived;
        if (thoughtsFilter === 'archived') return t.is_archived;
        return !t.is_archived;
      })
      .filter((t) => {
        if (!thoughtsSearch.trim()) return true;
        const q = thoughtsSearch.toLowerCase();
        return (
          t.thought.toLowerCase().includes(q) ||
          t.user?.name?.toLowerCase().includes(q)
        );
      });
  }, [rawThoughts, localThoughtsState, thoughtsFilter, thoughtsSearch]);

  // Analytics totals from API response
  const totalPolls = analyticsRes?.data?.totalPoll ?? 0;
  const totalPollResponses = analyticsRes?.data?.totalPollAnswer ?? 0;
  const totalUserThoughts = analyticsRes?.data?.totalUserThoughts ?? 0;

  // CSV Export Handlers (Temporarily commented out)
  /*
  const handleExportPollResults = () => {
    if (!activePoll || !pollAnswers.length) return;
    let csv = `Poll Question,Answer Option,Count,Percentage (%)\n`;
    pollAnswers.forEach((ans) => {
      csv += `"${activePoll.question.replace(/"/g, '""')}","${ans.answer.replace(/"/g, '""')}",${ans.count},${ans.percentage}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `poll_results_${activePoll.id || activePoll._id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportThoughts = () => {
    if (!thoughts.length) return;
    let csv = `User Name,Thought,Status,Date\n`;
    thoughts.forEach((t) => {
      const statusStr = t.is_archived ? 'Archived' : t.is_read ? 'Read' : 'New';
      const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '';
      csv += `"${(t.user?.name || 'Anonymous').replace(/"/g, '""')}","${t.thought.replace(/"/g, '""')}","${statusStr}","${dateStr}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audience_thoughts_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  */

  /*
  const toggleRead = (id: string) => {
    setLocalThoughtsState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        is_read: !(prev[id]?.is_read ?? rawThoughts.find((t) => t._id === id)?.is_read ?? false),
      },
    }));
  };

  const toggleArchive = (id: string) => {
    setLocalThoughtsState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        is_archived: !(prev[id]?.is_archived ?? rawThoughts.find((t) => t._id === id)?.is_archived ?? false),
      },
    }));
  };
  */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        eyebrow="INSIGHT › AUDIENCE ENGAGEMENT"
        title="Audience Engagement"
        description="Understand how your audience is interacting with your programmes."
        actions={
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Programme</span>
            <Select
              value={programmeId || undefined}
              onChange={setProgrammeId}
              options={programmeOptions}
              loading={isProgrammesLoading}
              placeholder="Select programme"
              disabled={!programmeOptions.length}
              className="w-56"
              dropdownMatchSelectWidth={false}
            />
          </div>
        }
      />

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Polls */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm flex items-center gap-4 transition-all hover:border-gray-300">
          <div className="w-11 h-11 rounded-full bg-[#0F5257]/10 flex items-center justify-center text-[#0F5257] shrink-0">
            <Vote className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Polls</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5 tracking-tight">
              {isAnalyticsLoading ? '...' : formatNumber(totalPolls)}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Across this programme</div>
          </div>
        </div>

        {/* Card 2: Poll responses */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm flex items-center gap-4 transition-all hover:border-gray-300">
          <div className="w-11 h-11 rounded-full bg-[#0F5257]/10 flex items-center justify-center text-[#0F5257] shrink-0">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Poll responses</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5 tracking-tight">
              {isAnalyticsLoading ? '...' : formatNumber(totalPollResponses)}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Total responses</div>
          </div>
        </div>

        {/* Card 3: Audience thoughts */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm flex items-center gap-4 transition-all hover:border-gray-300">
          <div className="w-11 h-11 rounded-full bg-[#0F5257]/10 flex items-center justify-center text-[#0F5257] shrink-0">
            <MessageSquare className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Audience thoughts</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5 tracking-tight">
              {isAnalyticsLoading ? '...' : formatNumber(totalUserThoughts)}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Total submissions</div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8 -mb-px">
          <button
            onClick={() => handleTabChange('poll-results')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'poll-results'
                ? 'text-[#0F5257] border-b-2 border-[#0F5257]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Poll Results
          </button>
          <button
            onClick={() => handleTabChange('audience-thoughts')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'audience-thoughts'
                ? 'text-[#0F5257] border-b-2 border-[#0F5257]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Audience Thoughts
          </button>
        </nav>
      </div>

      {/* Tab 1: Poll Results */}
      {activeTab === 'poll-results' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-6">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Poll Results</h2>
              <p className="text-xs text-gray-500 mt-0.5">Select a poll to view its results</p>
            </div>
            {/* {polls.length > 0 && (
              <button
                onClick={handleExportPollResults}
                disabled={!activePoll || !pollAnswers.length}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-start sm:self-auto shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-gray-500" />
                Export poll results
              </button>
            )} */}
          </div>

          {!programmeId ? (
            <div className="py-16 text-center">
              <EmptyState
                icon={Vote}
                title="No Programme Selected"
                description="Please select a programme from the dropdown above to view poll results."
              />
            </div>
          ) : isPollsLoading ? (
            <div className="py-16 text-center text-xs text-gray-400">Loading poll data...</div>
          ) : polls.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Vote}
                title="No Polls Found"
                description={`There are currently no polls created for ${activeProgrammeTitle}.`}
              />
            </div>
          ) : (
            /* Split Content: Left List, Right Answers */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Polls list */}
              <div className="lg:col-span-5 space-y-2.5">
                {polls.map((poll) => {
                  const isSelected =
                    (activePoll?._id && activePoll._id === poll._id) ||
                    (activePoll?.id && activePoll.id === poll.id);
                  return (
                    <div
                      key={poll._id || poll.id}
                      onClick={() => setSelectedPollId(poll._id || poll.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#0F5257]/40 bg-[#0F5257]/5 shadow-2xs'
                          : 'border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-900 line-clamp-2">
                          {poll.question}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {formatNumber(poll.response ?? 0)} responses
                        </div>
                      </div>

                      <div className="shrink-0">
                        {poll.status === 'active' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0F5257]/10 text-[#0F5257]">
                            Results available
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right: Selected Poll Details */}
              <div className="lg:col-span-7 rounded-xl border border-gray-200/80 bg-gray-50/40 p-6 space-y-6">
                {activePoll ? (
                  <>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{activePoll.question}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatNumber(activePoll.response ?? 0)} responses
                      </p>
                    </div>

                    {/* Options Progress Bars */}
                    <div className="space-y-4">
                      {isPollAnswersLoading ? (
                        <div className="py-8 text-center text-xs text-gray-400">
                          Loading poll answers...
                        </div>
                      ) : pollAnswers.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-500">
                          No answer data available for this poll yet.
                        </div>
                      ) : (
                        pollAnswers.map((item) => (
                          <div key={item.answer_id || item.answer} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-gray-800">{item.answer}</span>
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-gray-600">
                                  {formatNumber(item.count ?? 0)}
                                </span>
                                <span className="font-semibold text-gray-900 min-w-9 text-right">
                                  {item.percentage !== undefined && item.percentage !== null
                                    ? Number.isInteger(item.percentage)
                                      ? item.percentage
                                      : item.percentage.toFixed(2)
                                    : 0}%
                                </span>
                              </div>
                            </div>
                            {/* Bar background */}
                            <div className="w-full h-2.5 bg-gray-200/70 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#0F5257] rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${Math.min(100, Math.max(0, item.percentage ?? 0))}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Poll Metadata Card */}
                    <div className="pt-4 border-t border-gray-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500">
                      <div className="space-y-1.5">
                        {activePoll.status === 'closed' ? (
                          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <Lock className="w-3.5 h-3.5 text-gray-400" />
                            Poll closed
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Poll active
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5257]" />
                          Audience results available
                        </div>
                      </div>

                      {(activePoll.closedAt || activePoll.resultsAvailableAt) && (
                        <div className="space-y-1 sm:text-right">
                          {activePoll.closedAt && (
                            <div className="flex items-center sm:justify-end gap-1.5 text-gray-500">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {activePoll.closedAt}
                            </div>
                          )}
                          {activePoll.resultsAvailableAt && (
                            <div className="flex items-center sm:justify-end gap-1.5 text-gray-500">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {activePoll.resultsAvailableAt}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-16 text-center text-xs text-gray-400">
                    Select a poll from the left list to view results
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Audience Thoughts */}
      {activeTab === 'audience-thoughts' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-6">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Audience Thoughts</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Audience submissions from this programme.
              </p>
            </div>
            {/* {thoughts.length > 0 && (
              <button
                onClick={handleExportThoughts}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors self-start sm:self-auto shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                Export audience thoughts
              </button>
            )} */}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* <Select
              value={thoughtsFilter}
              onChange={setThoughtsFilter}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Unread', value: 'unread' },
                { label: 'Read', value: 'read' },
                { label: 'Archived', value: 'archived' },
              ]}
              className="w-full sm:w-32"
            /> */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={thoughtsSearch}
                onChange={(e) => setThoughtsSearch(e.target.value)}
                placeholder="Search thoughts..."
                className="w-full pl-9 pr-4 py-1.5 w-80 py-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F5257]/20 focus:border-[#0F5257] bg-white"
              />
            </div>
          </div>

          {/* Thoughts List */}
          {!programmeId ? (
            <div className="py-12">
              <EmptyState
                icon={Inbox}
                title="No Programme Selected"
                description="Please select a programme from the dropdown to view user thoughts."
              />
            </div>
          ) : isThoughtsLoading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading thoughts...</div>
          ) : thoughts.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Inbox}
                title="No Audience Thoughts"
                description={
                  thoughtsSearch.trim() || thoughtsFilter !== 'all'
                    ? 'No thoughts match your selected filter or search criteria.'
                    : `No audience thoughts submitted for ${activeProgrammeTitle} yet.`
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {thoughts.map((item) => (
                <div
                  key={item._id}
                  className="p-5 rounded-xl border border-gray-200/80 bg-white hover:border-gray-300 transition-all space-y-3 shadow-2xs"
                >
                  <p className="text- text-gray-900 leading-relaxed font-normal">
                    {item.thought}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100 text-[11px] text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">
                        {item.user?.name || 'Anonymous User'}
                      </span>
                      <span>•</span>
                      <span className="font-medium">{activeProgrammeTitle}</span>
                      {item.createdAt && (
                        <>
                          <span>•</span>
                          <span>
                            {new Date(item.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </>
                      )}
                      {/* {!item.is_read && !item.is_archived && (
                        <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                          New
                        </span>
                      )} */}
                    </div>

                    {/* Actions */}
                    {/* <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleRead(item._id)}
                        className="text-xs font-semibold text-gray-700 hover:text-black transition-colors"
                      >
                        {item.is_read ? 'Mark as unread' : 'Mark as read'}
                      </button>
                      <button
                        onClick={() => toggleArchive(item._id)}
                        className="text-xs font-semibold text-gray-700 hover:text-black transition-colors"
                      >
                        {item.is_archived ? 'Unarchive' : 'Archive'}
                      </button>
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
