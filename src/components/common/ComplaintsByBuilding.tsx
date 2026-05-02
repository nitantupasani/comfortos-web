import { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  MessageSquare,
  ThumbsUp,
  Clock,
  Building2,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Thermometer,
  Snowflake,
  Wind,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import {
  complaintsApi,
  type Complaint,
  type ComplaintType,
} from '../../api/complaints';
import {
  PageHeader,
  KpiCard,
  SectionCard,
  StatusBadge,
  EmptyState,
} from './ui';

const TYPE_ICON: Record<ComplaintType, typeof Thermometer> = {
  hot: Thermometer,
  cold: Snowflake,
  air_quality: Wind,
  cleanliness: Sparkles,
  other: HelpCircle,
};

const TYPE_LABEL: Record<ComplaintType, string> = {
  hot: 'Too hot',
  cold: 'Too cold',
  air_quality: 'Air quality',
  cleanliness: 'Cleanliness',
  other: 'Other',
};

type SortMode = 'priority' | 'recency';

interface BuildingAgg {
  buildingId: string;
  buildingName: string;
  count: number;
  maxCosigns: number;
  totalCosigns: number;
  latestAt: string;
  topComplaint: Complaint;
  complaints: Complaint[];
}

interface Props {
  scope: 'admin' | 'fm';
}

export default function ComplaintsByBuilding({ scope }: Props) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortMode>('priority');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const rows = await complaintsApi.list();
        if (!cancelled) setComplaints(rows);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load complaints');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const aggregates = useMemo<BuildingAgg[]>(() => {
    const byBuilding = new Map<string, BuildingAgg>();
    for (const c of complaints) {
      const existing = byBuilding.get(c.buildingId);
      if (!existing) {
        byBuilding.set(c.buildingId, {
          buildingId: c.buildingId,
          buildingName: c.buildingName,
          count: 1,
          maxCosigns: c.cosignCount,
          totalCosigns: c.cosignCount,
          latestAt: c.createdAt,
          topComplaint: c,
          complaints: [c],
        });
      } else {
        existing.count += 1;
        existing.totalCosigns += c.cosignCount;
        existing.complaints.push(c);
        if (c.cosignCount > existing.maxCosigns) {
          existing.maxCosigns = c.cosignCount;
          existing.topComplaint = c;
        }
        if (c.createdAt > existing.latestAt) existing.latestAt = c.createdAt;
      }
    }
    const list = Array.from(byBuilding.values());
    list.sort((a, b) => {
      if (sort === 'recency') {
        if (b.latestAt !== a.latestAt) return b.latestAt.localeCompare(a.latestAt);
        return b.maxCosigns - a.maxCosigns;
      }
      if (b.maxCosigns !== a.maxCosigns) return b.maxCosigns - a.maxCosigns;
      return b.latestAt.localeCompare(a.latestAt);
    });
    return list;
  }, [complaints, sort]);

  const totalComplaints = complaints.length;
  const totalCosigns = useMemo(
    () => complaints.reduce((sum, c) => sum + c.cosignCount, 0),
    [complaints],
  );
  const buildingsAffected = aggregates.length;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const description =
    scope === 'admin'
      ? 'Buildings ranked by occupant complaint pressure across your estate.'
      : 'Buildings you manage, ranked by occupant complaint pressure.';

  return (
    <>
      <PageHeader title="Complaints" description={description} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          tone="rose"
          icon={<MessageSquare className="h-5 w-5" />}
          label="Open complaints"
          value={loading ? '—' : totalComplaints}
          loading={loading}
        />
        <KpiCard
          tone="amber"
          icon={<ThumbsUp className="h-5 w-5" />}
          label="Total co-signs"
          value={loading ? '—' : totalCosigns.toLocaleString()}
          loading={loading}
        />
        <KpiCard
          tone="primary"
          icon={<Building2 className="h-5 w-5" />}
          label="Buildings affected"
          value={loading ? '—' : buildingsAffected}
          loading={loading}
        />
      </div>

      <div className="mt-5">
        <SectionCard
          icon={<Building2 className="h-4 w-4" />}
          title="Buildings by complaint pressure"
          description="Top complaint per building shown. Click a row to see all complaints."
          action={
            <div className="flex items-center gap-2 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
              <button
                onClick={() => setSort('priority')}
                className={`px-2.5 py-1 rounded-full font-medium ${
                  sort === 'priority'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Co-signs (max)
              </button>
              <button
                onClick={() => setSort('recency')}
                className={`px-2.5 py-1 rounded-full font-medium ${
                  sort === 'recency'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Recency
              </button>
            </div>
          }
          padding="none"
        >
          {error ? (
            <div className="p-5 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">
              {error}
            </div>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : aggregates.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="h-5 w-5" />}
              title="No complaints"
              description="No occupants have raised complaints yet."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {aggregates.map((agg) => (
                <BuildingRow
                  key={agg.buildingId}
                  agg={agg}
                  expanded={expanded.has(agg.buildingId)}
                  onToggle={() => toggleExpand(agg.buildingId)}
                />
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}

interface RowProps {
  agg: BuildingAgg;
  expanded: boolean;
  onToggle: () => void;
}

function BuildingRow({ agg, expanded, onToggle }: RowProps) {
  const TopIcon = TYPE_ICON[agg.topComplaint.complaintType];
  const latest = new Date(agg.latestAt);
  const tone = agg.maxCosigns >= 5 ? 'danger' : agg.maxCosigns >= 2 ? 'warning' : 'info';

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors flex items-start gap-3"
      >
        <div className="shrink-0 mt-0.5 text-gray-400">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {agg.buildingName}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <TopIcon className="h-3.5 w-3.5" />
                  {TYPE_LABEL[agg.topComplaint.complaintType]}
                </span>
                <span className="text-gray-300">·</span>
                <span className="truncate max-w-xs">{agg.topComplaint.title}</span>
                <span className="text-gray-300">·</span>
                <Clock className="h-3 w-3" />
                <span>
                  {latest.toLocaleDateString()} {latest.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge tone={tone} dot>
                <ThumbsUp className="h-3 w-3" />
                {agg.maxCosigns} max
              </StatusBadge>
              <StatusBadge tone="neutral">
                {agg.count} {agg.count === 1 ? 'complaint' : 'complaints'}
              </StatusBadge>
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-4 pl-12 space-y-2">
          {[...agg.complaints]
            .sort((a, b) => {
              if (b.cosignCount !== a.cosignCount) return b.cosignCount - a.cosignCount;
              return b.createdAt.localeCompare(a.createdAt);
            })
            .map((c) => {
              const Icon = TYPE_ICON[c.complaintType];
              const when = new Date(c.createdAt);
              return (
                <div
                  key={c.id}
                  className="rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-start gap-2">
                      <Icon className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {TYPE_LABEL[c.complaintType]} · By {c.authorName || 'an occupant'} ·{' '}
                          {when.toLocaleDateString()}{' '}
                          {when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {c.description && (
                          <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap line-clamp-2">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge tone={c.cosignCount >= 5 ? 'danger' : c.cosignCount >= 2 ? 'warning' : 'neutral'}>
                        <ThumbsUp className="h-3 w-3" />
                        {c.cosignCount}
                      </StatusBadge>
                      {c.comments.length > 0 && (
                        <StatusBadge tone="info">
                          <MessageSquare className="h-3 w-3" />
                          {c.comments.length}
                        </StatusBadge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </li>
  );
}
