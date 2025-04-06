import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { V1WorkflowRun } from '@/lib/api';
interface TimelineContextState {
  earliest: number;
  latest: number | undefined;
  updateTimeRange: (item: V1WorkflowRun) => void;
  resetTimeRange: () => void;
  timeRange: number;
}

const TimelineContext = createContext<TimelineContextState | null>(null);

interface TimelineProviderProps {
  children: ReactNode;
}

export function TimelineProvider({ children }: TimelineProviderProps) {
  const [earliest, setEarliest] = useState<number>(Date.now());
  const [latest, setLatest] = useState<number | undefined>(undefined);

  const updateTimeRange = useCallback(
    (item: V1WorkflowRun) => {
      const times = [item.createdAt, item.startedAt, item.finishedAt].reduce<
        number[]
      >((acc, time) => {
        if (time) {
          acc.push(new Date(time).getTime());
        }
        return acc;
      }, []);

      const earliestTime = Math.min(...times);
      const latestTime = Math.max(...times);

      if (earliestTime < earliest) {
        setEarliest(earliestTime);
      }
      if (latest === undefined || latestTime > latest) {
        setLatest(latestTime);
      }
    },
    [earliest, latest, setEarliest, setLatest],
  );

  const timeRange = useMemo(() => {
    if (latest === undefined || earliest === undefined) {
      return 1;
    }
    return latest - earliest;
  }, [latest, earliest]);

  const resetTimeRange = useCallback(() => {
    setEarliest(Date.now());
    setLatest(undefined);
  }, [setEarliest, setLatest]);

  const value = {
    earliest,
    latest,
    updateTimeRange,
    timeRange,
    resetTimeRange,
  };

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
}

export default function useTimeline(): TimelineContextState {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error(
      'useTimelineContext must be used within a TimelineProvider',
    );
  }
  return context;
}
