import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MoreHorizontal,
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Calendar,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowLeft,
} from 'lucide-react';

// Mock data for scheduled runs
type ScheduledRun = {
  id: string;
  name: string;
  workflowId: string;
  workflowName: string;
  schedule: {
    startTime: string;
    frequency: string;
    timezone: string;
  };
  status: 'ACTIVE' | 'PAUSED';
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
};

const mockScheduledRuns: ScheduledRun[] = [
  {
    id: '1',
    name: 'Daily Data Pipeline',
    workflowId: 'wf-123',
    workflowName: 'Data Pipeline',
    schedule: {
      startTime: '2023-08-01T02:00:00Z',
      frequency: 'DAILY',
      timezone: 'UTC',
    },
    status: 'ACTIVE',
    lastRun: '2023-08-20T02:00:00Z',
    nextRun: '2023-08-21T02:00:00Z',
    createdAt: '2023-07-15T14:30:00Z',
  },
  {
    id: '2',
    name: 'Weekly Reports',
    workflowId: 'wf-456',
    workflowName: 'Report Generator',
    schedule: {
      startTime: '2023-08-07T08:00:00Z',
      frequency: 'WEEKLY',
      timezone: 'America/New_York',
    },
    status: 'ACTIVE',
    lastRun: '2023-08-14T08:00:00Z',
    nextRun: '2023-08-21T08:00:00Z',
    createdAt: '2023-07-01T10:15:00Z',
  },
  {
    id: '3',
    name: 'Monthly Cleanup',
    workflowId: 'wf-789',
    workflowName: 'Cleanup Job',
    schedule: {
      startTime: '2023-08-01T00:00:00Z',
      frequency: 'MONTHLY',
      timezone: 'UTC',
    },
    status: 'PAUSED',
    lastRun: '2023-08-01T00:00:00Z',
    nextRun: '2023-09-01T00:00:00Z',
    createdAt: '2023-06-15T09:45:00Z',
  },
  {
    id: '4',
    name: 'Hourly Monitoring',
    workflowId: 'wf-101',
    workflowName: 'System Monitor',
    schedule: {
      startTime: '2023-08-01T00:00:00Z',
      frequency: 'HOURLY',
      timezone: 'UTC',
    },
    status: 'ACTIVE',
    lastRun: '2023-08-20T13:00:00Z',
    nextRun: '2023-08-20T14:00:00Z',
    createdAt: '2023-08-01T11:20:00Z',
  },
];

export default function ScheduledRunsPage() {
  const { scheduledRunId } = useParams<{ scheduledRunId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduledRuns, setScheduledRuns] =
    useState<ScheduledRun[]>(mockScheduledRuns);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newScheduledRun, setNewScheduledRun] = useState({
    name: '',
    workflowId: '',
    startTime: '',
    frequency: 'DAILY',
    timezone: 'UTC',
  });
  const [editingRun, setEditingRun] = useState<ScheduledRun | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<ScheduledRun | null>(null);

  // Effect to handle URL params and open details sheet
  useEffect(() => {
    if (scheduledRunId) {
      const run = scheduledRuns.find((run) => run.id === scheduledRunId);
      if (run) {
        setSelectedRun(run);
        setDetailsOpen(true);
      }
    } else {
      setDetailsOpen(false);
      setSelectedRun(null);
    }
  }, [scheduledRunId, scheduledRuns]);

  // Close details sheet and navigate back
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    navigate('/scheduled');
  };

  // Open details sheet and update URL
  const handleViewDetails = (run: ScheduledRun) => {
    setSelectedRun(run);
    setDetailsOpen(true);
    navigate(`/scheduled/${run.id}`);
  };

  // Filtered runs based on search query
  const filteredRuns = scheduledRuns.filter(
    (run) =>
      run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.workflowName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Toggle run status
  const toggleRunStatus = (id: string) => {
    setScheduledRuns((prev) =>
      prev.map((run) => {
        if (run.id === id) {
          return {
            ...run,
            status: run.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE',
          };
        }
        return run;
      }),
    );
  };

  // Delete scheduled run
  const deleteScheduledRun = (id: string) => {
    setScheduledRuns((prev) => prev.filter((run) => run.id !== id));
  };

  // Handle create new scheduled run
  const handleCreateScheduledRun = () => {
    const newRun: ScheduledRun = {
      id: Math.random().toString(36).substring(2, 11),
      name: newScheduledRun.name,
      workflowId: newScheduledRun.workflowId,
      workflowName: `Workflow-${newScheduledRun.workflowId.substring(0, 4)}`,
      schedule: {
        startTime: newScheduledRun.startTime,
        frequency: newScheduledRun.frequency,
        timezone: newScheduledRun.timezone,
      },
      status: 'ACTIVE',
      lastRun: undefined,
      nextRun: newScheduledRun.startTime,
      createdAt: new Date().toISOString(),
    };

    setScheduledRuns((prev) => [...prev, newRun]);
    setIsCreateDialogOpen(false);
    setNewScheduledRun({
      name: '',
      workflowId: '',
      startTime: '',
      frequency: 'DAILY',
      timezone: 'UTC',
    });
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return 'Never';
    }
    return new Date(dateString).toLocaleString();
  };

  // Format frequency
  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case 'HOURLY':
        return 'Every hour';
      case 'DAILY':
        return 'Every day';
      case 'WEEKLY':
        return 'Every week';
      case 'MONTHLY':
        return 'Every month';
      default:
        return frequency;
    }
  };

  // Get status badge
  const getStatusBadge = (status: 'ACTIVE' | 'PAUSED') => {
    return status === 'ACTIVE' ? (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200"
      >
        Active
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-700 border-red-200"
      >
        Paused
      </Badge>
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Scheduled Runs</h1>
            <p className="text-muted-foreground">
              Manage scheduled workflow executions
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Schedule New Run
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Run</DialogTitle>
                <DialogDescription>
                  Set up a scheduled execution of a workflow
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="name">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={newScheduledRun.name}
                    onChange={(e) =>
                      setNewScheduledRun({
                        ...newScheduledRun,
                        name: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Daily Data Pipeline"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="workflowId">
                    Workflow ID
                  </label>
                  <Input
                    id="workflowId"
                    value={newScheduledRun.workflowId}
                    onChange={(e) =>
                      setNewScheduledRun({
                        ...newScheduledRun,
                        workflowId: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="workflow-123"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="startTime">
                    Start Time
                  </label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={newScheduledRun.startTime}
                    onChange={(e) =>
                      setNewScheduledRun({
                        ...newScheduledRun,
                        startTime: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="frequency">
                    Frequency
                  </label>
                  <select
                    id="frequency"
                    value={newScheduledRun.frequency}
                    onChange={(e) =>
                      setNewScheduledRun({
                        ...newScheduledRun,
                        frequency: e.target.value,
                      })
                    }
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="HOURLY">Hourly</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="timezone">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={newScheduledRun.timezone}
                    onChange={(e) =>
                      setNewScheduledRun({
                        ...newScheduledRun,
                        timezone: e.target.value,
                      })
                    }
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateScheduledRun}>Schedule Run</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          {editingRun && (
            <Dialog
              open={!!editingRun}
              onOpenChange={(open) => !open && setEditingRun(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Scheduled Run</DialogTitle>
                  <DialogDescription>
                    Modify your scheduled workflow execution
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm" htmlFor="edit-name">
                      Name
                    </label>
                    <Input
                      id="edit-name"
                      value={editingRun.name}
                      onChange={(e) =>
                        setEditingRun({
                          ...editingRun,
                          name: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm" htmlFor="edit-freq">
                      Frequency
                    </label>
                    <select
                      id="edit-freq"
                      value={editingRun.schedule.frequency}
                      onChange={(e) =>
                        setEditingRun({
                          ...editingRun,
                          schedule: {
                            ...editingRun.schedule,
                            frequency: e.target.value,
                          },
                        })
                      }
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="HOURLY">Hourly</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm" htmlFor="edit-tz">
                      Timezone
                    </label>
                    <select
                      id="edit-tz"
                      value={editingRun.schedule.timezone}
                      onChange={(e) =>
                        setEditingRun({
                          ...editingRun,
                          schedule: {
                            ...editingRun.schedule,
                            timezone: e.target.value,
                          },
                        })
                      }
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm" htmlFor="edit-status">
                      Status
                    </label>
                    <div className="col-span-3">
                      <select
                        id="edit-status"
                        value={editingRun.status}
                        onChange={(e) =>
                          setEditingRun({
                            ...editingRun,
                            status: e.target.value as 'ACTIVE' | 'PAUSED',
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="PAUSED">Paused</option>
                      </select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingRun(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setScheduledRuns((prev) =>
                        prev.map((run) =>
                          run.id === editingRun.id ? editingRun : run,
                        ),
                      );
                      setEditingRun(null);
                    }}
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              placeholder="Search scheduled runs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10"
            />
            <Button type="submit" size="icon" className="h-10 w-10">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{scheduledRuns.length}</div>
              <p className="text-sm text-muted-foreground">
                Total Scheduled Runs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {scheduledRuns.filter((run) => run.status === 'ACTIVE').length}
              </div>
              <p className="text-sm text-muted-foreground">Active Schedules</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {scheduledRuns.filter((run) => run.status === 'PAUSED').length}
              </div>
              <p className="text-sm text-muted-foreground">Paused Schedules</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRuns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No scheduled runs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRuns.map((run) => (
                    <TableRow
                      key={run.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetails(run)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {run.name}
                        </div>
                      </TableCell>
                      <TableCell>{run.workflowName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatFrequency(run.schedule.frequency)}</span>
                          <span className="text-xs text-muted-foreground">
                            {run.schedule.timezone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(run.nextRun)}</TableCell>
                      <TableCell>{getStatusBadge(run.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(run.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRunStatus(run.id);
                            }}
                            title={
                              run.status === 'ACTIVE' ? 'Pause' : 'Activate'
                            }
                          >
                            {run.status === 'ACTIVE' ? (
                              <Pause className="h-4 w-4 text-amber-600" />
                            ) : (
                              <Play className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingRun(run);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRunStatus(run.id);
                                }}
                              >
                                {run.status === 'ACTIVE' ? (
                                  <>
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteScheduledRun(run.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{filteredRuns.length}</span>{' '}
            of <span className="font-medium">{scheduledRuns.length}</span>{' '}
            scheduled runs
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {}}
              disabled={true}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {}}
              disabled={true}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Details Sheet */}
      <Sheet
        open={detailsOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDetails();
          }
        }}
      >
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Schedule Details</SheetTitle>
            <SheetDescription>
              View details about this scheduled run
            </SheetDescription>
          </SheetHeader>
          {selectedRun && (
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Name
                </h4>
                <p className="text-base font-medium">{selectedRun.name}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Status
                </h4>
                <div>{getStatusBadge(selectedRun.status)}</div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Workflow
                </h4>
                <p className="text-base">{selectedRun.workflowName}</p>
                <p className="text-sm text-muted-foreground">
                  ID: {selectedRun.workflowId}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Schedule
                </h4>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatFrequency(selectedRun.schedule.frequency)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Timezone: {selectedRun.schedule.timezone}
                </p>
                <p className="text-sm text-muted-foreground">
                  Start Time: {formatDate(selectedRun.schedule.startTime)}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Run History
                </h4>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Last Run: {formatDate(selectedRun.lastRun)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Next Run: {formatDate(selectedRun.nextRun)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Created
                </h4>
                <p className="text-sm">{formatDate(selectedRun.createdAt)}</p>
              </div>
            </div>
          )}
          <SheetFooter className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleCloseDetails()}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
            {selectedRun && selectedRun.status === 'ACTIVE' ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-amber-600 border-amber-200 hover:bg-amber-50"
                onClick={() => toggleRunStatus(selectedRun.id)}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause Schedule
              </Button>
            ) : (
              selectedRun && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => toggleRunStatus(selectedRun.id)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Activate Schedule
                </Button>
              )
            )}
            {selectedRun && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  deleteScheduledRun(selectedRun.id);
                  handleCloseDetails();
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
