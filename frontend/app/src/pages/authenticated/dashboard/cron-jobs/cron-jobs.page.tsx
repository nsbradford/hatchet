import { useState } from 'react';
import useCrons from '@/hooks/use-crons';
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
  Play,
  Pause,
  CalendarDays,
} from 'lucide-react';

export default function CronJobsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCron, setEditingCron] = useState<any>(null);
  const [newCron, setNewCron] = useState({
    workflowId: '',
    schedule: '0 0 * * *', // Default: Daily at midnight
    timezone: 'UTC',
    name: '',
    input: '{}',
    enabled: true,
  });

  // Use the crons hook
  const {
    data: crons = [],
    isLoading,
    filters,
    setFilters,
    create,
    update,
    delete: deleteCron,
    paginationState,
    setPagination,
  } = useCrons({
    initialPagination: { currentPage: 1, pageSize: 10 },
  });

  // Filter crons based on search query
  const filteredCrons = searchQuery
    ? crons.filter(
        (cron) =>
          cron.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cron.workflowName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : crons;

  // Handle search
  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery });
  };

  // Format cron schedule for display
  const formatCronSchedule = (schedule?: string) => {
    if (!schedule) {
      return 'Unknown schedule';
    }

    // This is a simplistic way to describe cron schedules - in a real app you might want to use a library
    const parts = schedule.split(' ');
    if (parts.length !== 5) {
      return schedule;
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    if (
      minute === '0' &&
      hour === '0' &&
      dayOfMonth === '*' &&
      month === '*' &&
      dayOfWeek === '*'
    ) {
      return 'Daily at midnight';
    }

    if (
      minute === '0' &&
      hour === '12' &&
      dayOfMonth === '*' &&
      month === '*' &&
      dayOfWeek === '*'
    ) {
      return 'Daily at noon';
    }

    if (
      minute === '0' &&
      dayOfMonth === '*' &&
      month === '*' &&
      dayOfWeek === '*'
    ) {
      return `Daily at ${hour}:00`;
    }

    if (dayOfMonth === '*' && month === '*' && dayOfWeek === '0') {
      return `Weekly on Sunday at ${hour}:${minute === '0' ? '00' : minute}`;
    }

    if (dayOfMonth === '1' && month === '*' && dayOfWeek === '*') {
      return `Monthly on the 1st at ${hour}:${minute === '0' ? '00' : minute}`;
    }

    return schedule;
  };

  // Handle pagination
  const handleNextPage = () => {
    if (
      paginationState.currentPage < ((crons as any).pagination?.num_pages || 1)
    ) {
      setPagination({
        ...paginationState,
        currentPage: paginationState.currentPage + 1,
      });
    }
  };

  const handlePreviousPage = () => {
    if (paginationState.currentPage > 1) {
      setPagination({
        ...paginationState,
        currentPage: paginationState.currentPage - 1,
      });
    }
  };

  // Handle creating a new cron job
  const handleCreateCron = async () => {
    try {
      await create.mutateAsync({
        workflowId: newCron.workflowId,
        data: {
          // @ts-ignore - API type mismatch
          schedule: newCron.schedule,
          timezone: newCron.timezone,
          name: newCron.name,
          input: JSON.parse(newCron.input),
          enabled: newCron.enabled,
        },
      });
      setShowCreateDialog(false);
      setNewCron({
        workflowId: '',
        schedule: '0 0 * * *',
        timezone: 'UTC',
        name: '',
        input: '{}',
        enabled: true,
      });
    } catch (error) {
      console.error('Failed to create cron job:', error);
    }
  };

  // Handle updating a cron job
  const handleUpdateCron = async () => {
    if (!editingCron) {
      return;
    }

    try {
      await update.mutateAsync({
        cronId: editingCron.id,
        workflowId: editingCron.workflowId,
        data: {
          // @ts-ignore - API type mismatch
          schedule: editingCron.schedule,
          timezone: editingCron.timezone,
          name: editingCron.name,
          input:
            typeof editingCron.input === 'string'
              ? JSON.parse(editingCron.input)
              : editingCron.input,
          enabled: editingCron.enabled,
        },
      });
      setEditingCron(null);
    } catch (error) {
      console.error('Failed to update cron job:', error);
    }
  };

  // Handle deleting a cron job
  const handleDeleteCron = async (cronId: string) => {
    try {
      await deleteCron.mutateAsync(cronId);
    } catch (error) {
      console.error('Failed to delete cron job:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Cron Jobs</h1>
            <p className="text-muted-foreground">
              Schedule recurring workflows based on cron expressions
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Cron Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Cron Job</DialogTitle>
                <DialogDescription>
                  Schedule a recurring workflow execution
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="name">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={newCron.name}
                    onChange={(e) =>
                      setNewCron({ ...newCron, name: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="Daily API cleanup"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="workflowId">
                    Workflow ID
                  </label>
                  <Input
                    id="workflowId"
                    value={newCron.workflowId}
                    onChange={(e) =>
                      setNewCron({ ...newCron, workflowId: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="workflow-123"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="schedule">
                    Schedule
                  </label>
                  <Input
                    id="schedule"
                    value={newCron.schedule}
                    onChange={(e) =>
                      setNewCron({ ...newCron, schedule: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="0 0 * * *"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="timezone">
                    Timezone
                  </label>
                  <Input
                    id="timezone"
                    value={newCron.timezone}
                    onChange={(e) =>
                      setNewCron({ ...newCron, timezone: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="UTC"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="input">
                    Input (JSON)
                  </label>
                  <textarea
                    id="input"
                    value={newCron.input}
                    onChange={(e) =>
                      setNewCron({ ...newCron, input: e.target.value })
                    }
                    className="col-span-3 min-h-[100px] flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder='{"key": "value"}'
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="enabled">
                    Enabled
                  </label>
                  <div className="col-span-3">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={newCron.enabled}
                      onChange={(e) =>
                        setNewCron({ ...newCron, enabled: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateCron} disabled={create.isPending}>
                  {create.isPending ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          {editingCron && (
            <Dialog
              open={!!editingCron}
              onOpenChange={(open) => !open && setEditingCron(null)}
            >
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Edit Cron Job</DialogTitle>
                  <DialogDescription>
                    Update your cron job settings
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm" htmlFor="edit-name">
                      Name
                    </label>
                    <Input
                      id="edit-name"
                      value={editingCron.name}
                      onChange={(e) =>
                        setEditingCron({ ...editingCron, name: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label
                      className="text-right text-sm"
                      htmlFor="edit-schedule"
                    >
                      Schedule
                    </label>
                    <Input
                      id="edit-schedule"
                      value={editingCron.schedule}
                      onChange={(e) =>
                        setEditingCron({
                          ...editingCron,
                          schedule: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label
                      className="text-right text-sm"
                      htmlFor="edit-timezone"
                    >
                      Timezone
                    </label>
                    <Input
                      id="edit-timezone"
                      value={editingCron.timezone}
                      onChange={(e) =>
                        setEditingCron({
                          ...editingCron,
                          timezone: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm" htmlFor="edit-input">
                      Input (JSON)
                    </label>
                    <textarea
                      id="edit-input"
                      value={
                        typeof editingCron.input === 'object'
                          ? JSON.stringify(editingCron.input, null, 2)
                          : editingCron.input
                      }
                      onChange={(e) =>
                        setEditingCron({
                          ...editingCron,
                          input: e.target.value,
                        })
                      }
                      className="col-span-3 min-h-[100px] flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label
                      className="text-right text-sm"
                      htmlFor="edit-enabled"
                    >
                      Enabled
                    </label>
                    <div className="col-span-3">
                      <input
                        type="checkbox"
                        id="edit-enabled"
                        checked={editingCron.enabled}
                        onChange={(e) =>
                          setEditingCron({
                            ...editingCron,
                            enabled: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditingCron(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateCron}
                    disabled={update.isPending}
                  >
                    {update.isPending ? 'Updating...' : 'Update'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              placeholder="Search cron jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-10"
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{crons.length}</div>
              <p className="text-sm text-muted-foreground">Total Cron Jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {crons.filter((c) => c.enabled).length}
              </div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {crons.filter((c) => !c.enabled).length}
              </div>
              <p className="text-sm text-muted-foreground">Paused Jobs</p>
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
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCrons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No cron jobs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCrons.map((cron) => (
                    <TableRow key={cron.metadata.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                          {cron.name ||
                            `Cron-${cron.metadata.id.substring(0, 8)}`}
                        </div>
                      </TableCell>
                      <TableCell>{cron.workflowName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>
                            {formatCronSchedule((cron as any).schedule)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(cron as any).schedule} ({(cron as any).timezone})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {cron.enabled ? (
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
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(cron.metadata.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              // Toggle enabled status
                              const updatedCron = {
                                ...cron,
                                enabled: !cron.enabled,
                                workflowId: cron.workflowId,
                              };
                              setEditingCron(updatedCron);
                              handleUpdateCron();
                            }}
                            title={cron.enabled ? 'Pause' : 'Activate'}
                          >
                            {cron.enabled ? (
                              <Pause className="h-4 w-4 text-amber-600" />
                            ) : (
                              <Play className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  setEditingCron({
                                    ...cron,
                                    workflowId: cron.workflowId,
                                    id: cron.metadata.id,
                                  })
                                }
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  // Toggle enabled status
                                  const updatedCron = {
                                    ...cron,
                                    enabled: !cron.enabled,
                                    workflowId: cron.workflowId,
                                    id: cron.metadata.id,
                                  };
                                  setEditingCron(updatedCron);
                                  handleUpdateCron();
                                }}
                              >
                                {cron.enabled ? (
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
                                onClick={() =>
                                  handleDeleteCron(cron.metadata.id)
                                }
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

        {!isLoading && crons.length > 0 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing page {paginationState.currentPage} of{' '}
              {(crons as any).pagination?.num_pages || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={paginationState.currentPage <= 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={
                  paginationState.currentPage >=
                    ((crons as any).pagination?.num_pages || 1) || isLoading
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
