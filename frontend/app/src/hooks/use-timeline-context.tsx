import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from 'react';

interface TimelineContextState {
  globalEarliestTime: number | null;
  globalLatestTime: number | null;
  updateTimeRange: (earliestTime: number, latestTime: number) => void;
  resetTimeRange: () => void;
}

const TimelineContext = createContext<TimelineContextState | null>(null);

interface TimelineProviderProps {
  children: ReactNode;
}

export function TimelineProvider({ children }: TimelineProviderProps) {
  const [globalEarliestTime, setGlobalEarliestTime] = useState<number | null>(
    null,
  );
  const [globalLatestTime, setGlobalLatestTime] = useState<number | null>(null);

  // Use a ref to track all ranges that need to be considered
  const timeRangesRef = useRef<Array<{ earliest: number; latest: number }>>([]);

  // Recalculate global time range from all tracked ranges
  const recalculateGlobalRange = useCallback(() => {
    if (timeRangesRef.current.length === 0) {
      setGlobalEarliestTime(null);
      setGlobalLatestTime(null);
      return;
    }

    // Calculate min/max across all ranges in a single pass
    const { earliest, latest } = timeRangesRef.current.reduce(
      (acc, range) => ({
        earliest: Math.min(acc.earliest, range.earliest),
        latest: Math.max(acc.latest, range.latest),
      }),
      { earliest: Infinity, latest: -Infinity },
    );

    setGlobalEarliestTime(earliest);
    setGlobalLatestTime(latest);
  }, []);

  // Memoized update function that efficiently tracks and updates ranges
  const updateTimeRange = useCallback(
    (earliestTime: number, latestTime: number) => {
      // Only update if times are valid
      if (earliestTime && latestTime && latestTime > earliestTime) {
        // Add new range, using component instance id as key
        const rangeId = Date.now();
        timeRangesRef.current.push({
          earliest: earliestTime,
          latest: latestTime,
        });

        // Recalculate global range
        recalculateGlobalRange();

        // Return cleanup function to remove this range when component unmounts
        return () => {
          timeRangesRef.current = timeRangesRef.current.filter(
            (_, index) => index !== timeRangesRef.current.length - 1,
          );
          recalculateGlobalRange();
        };
      }
      return undefined;
    },
    [recalculateGlobalRange],
  );

  const resetTimeRange = useCallback(() => {
    timeRangesRef.current = [];
    setGlobalEarliestTime(null);
    setGlobalLatestTime(null);
  }, []);

  const value = {
    globalEarliestTime,
    globalLatestTime,
    updateTimeRange,
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
