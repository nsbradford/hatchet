import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';

interface TimelineContextState {
  earliest: number | undefined;
  latest: number | undefined;
  updateTimeRange: (earliestTime: number, latestTime: number) => void;
}

const TimelineContext = createContext<TimelineContextState | null>(null);

interface TimelineProviderProps {
  children: ReactNode;
}

export function TimelineProvider({ children }: TimelineProviderProps) {
  const [earliest, setEarliest] = useState<number | undefined>(undefined);
  const [latest, setLatest] = useState<number | undefined>(undefined);

  const updateTimeRange = useCallback(
    (earliestTime: number, latestTime: number) => {
      setEarliest((prev) =>
        prev === undefined || earliestTime < prev ? earliestTime : prev,
      );

      setLatest((prev) =>
        prev === undefined || latestTime > prev ? latestTime : prev,
      );

      return () => {
        // Reset function if needed
      };
    },
    [], // No dependencies needed with functional updates
  );

  const value = {
    earliest,
    latest,
    updateTimeRange,
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
