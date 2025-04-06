import { AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Code } from '@/components/ui/code';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { V1TaskStatus } from '@/lib/api';

export interface RunOutputCardProps {
  output: any;
  errorMessage?: string;
  status: V1TaskStatus;
}

export function RunOutputCard({
  output,
  errorMessage,
  status,
}: RunOutputCardProps) {
  const isRunning = status === 'RUNNING';

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium">Output</CardTitle>
        <CardDescription className="text-xs">
          {isRunning
            ? 'The run is still in progress'
            : status === 'COMPLETED'
              ? 'The run completed successfully'
              : status === 'FAILED'
                ? 'The run failed with an error'
                : 'The run was cancelled'}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-2">
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="font-mono whitespace-pre-wrap">
              <Code
                language="json"
                variant="block"
                value={JSON.parse(JSON.stringify(errorMessage, null, 2))}
              />
            </AlertDescription>
          </Alert>
        ) : (
          <Code language="json" value={JSON.stringify(output, null, 2)} />
        )}
      </CardContent>
    </Card>
  );
}
