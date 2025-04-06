import { useState } from 'react';
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
  Lock,
} from 'lucide-react';

// Mock data for rate limits until we integrate with a real API
type RateLimit = {
  id: string;
  name: string;
  type: 'GLOBAL' | 'PER_TENANT' | 'PER_USER';
  limit: number;
  period: 'SECOND' | 'MINUTE' | 'HOUR' | 'DAY';
  resource: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

const mockRateLimits: RateLimit[] = [
  {
    id: '1',
    name: 'API Requests',
    type: 'GLOBAL',
    limit: 1000,
    period: 'MINUTE',
    resource: 'api',
    enabled: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Task Execution',
    type: 'PER_TENANT',
    limit: 500,
    period: 'HOUR',
    resource: 'tasks',
    enabled: true,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Worker Registration',
    type: 'PER_TENANT',
    limit: 50,
    period: 'DAY',
    resource: 'workers',
    enabled: false,
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
  },
  {
    id: '4',
    name: 'Webhook Calls',
    type: 'PER_USER',
    limit: 100,
    period: 'HOUR',
    resource: 'webhooks',
    enabled: true,
    createdAt: '2023-01-04T00:00:00Z',
    updatedAt: '2023-01-04T00:00:00Z',
  },
];

export default function RateLimitsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rateLimits, setRateLimits] = useState<RateLimit[]>(mockRateLimits);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRateLimit, setNewRateLimit] = useState({
    name: '',
    type: 'GLOBAL',
    limit: 100,
    period: 'MINUTE',
    resource: '',
  });

  // Filtered rate limits based on search query
  const filteredRateLimits = rateLimits.filter(
    (limit) =>
      limit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      limit.resource.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Toggle rate limit enabled status
  const toggleRateLimitStatus = (id: string) => {
    setRateLimits((prev) =>
      prev.map((limit) => {
        if (limit.id === id) {
          return { ...limit, enabled: !limit.enabled };
        }
        return limit;
      }),
    );
  };

  // Delete rate limit
  const deleteRateLimit = (id: string) => {
    setRateLimits((prev) => prev.filter((limit) => limit.id !== id));
  };

  // Handle create new rate limit
  const handleCreateRateLimit = () => {
    const newLimit: RateLimit = {
      id: Math.random().toString(36).substring(2, 11),
      ...newRateLimit,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as RateLimit;

    setRateLimits((prev) => [...prev, newLimit]);
    setIsCreateDialogOpen(false);
    setNewRateLimit({
      name: '',
      type: 'GLOBAL',
      limit: 100,
      period: 'MINUTE',
      resource: '',
    });
  };

  // Format the rate limit period display
  const formatPeriod = (limit: RateLimit) => {
    return `${limit.limit} per ${limit.period.toLowerCase()}`;
  };

  // Get status badge for rate limit
  const getStatusBadge = (enabled: boolean) => {
    return enabled ? (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200"
      >
        Enabled
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-700 border-red-200"
      >
        Disabled
      </Badge>
    );
  };

  // Get scope badge for rate limit type
  const getScopeBadge = (type: RateLimit['type']) => {
    switch (type) {
      case 'GLOBAL':
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Global
          </Badge>
        );
      case 'PER_TENANT':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Per Tenant
          </Badge>
        );
      case 'PER_USER':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Per User
          </Badge>
        );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Rate Limits</h1>
            <p className="text-muted-foreground">
              Manage rate limits for API endpoints and resources
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Rate Limit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Rate Limit</DialogTitle>
                <DialogDescription>
                  Set up a new rate limit for your resources
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="name">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={newRateLimit.name}
                    onChange={(e) =>
                      setNewRateLimit({
                        ...newRateLimit,
                        name: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="resource">
                    Resource
                  </label>
                  <Input
                    id="resource"
                    value={newRateLimit.resource}
                    onChange={(e) =>
                      setNewRateLimit({
                        ...newRateLimit,
                        resource: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="type">
                    Scope
                  </label>
                  <select
                    id="type"
                    value={newRateLimit.type}
                    onChange={(e) =>
                      setNewRateLimit({
                        ...newRateLimit,
                        type: e.target.value as RateLimit['type'],
                      })
                    }
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="GLOBAL">Global</option>
                    <option value="PER_TENANT">Per Tenant</option>
                    <option value="PER_USER">Per User</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="limit">
                    Limit
                  </label>
                  <Input
                    id="limit"
                    type="number"
                    value={newRateLimit.limit}
                    onChange={(e) =>
                      setNewRateLimit({
                        ...newRateLimit,
                        limit: parseInt(e.target.value, 10),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm" htmlFor="period">
                    Period
                  </label>
                  <select
                    id="period"
                    value={newRateLimit.period}
                    onChange={(e) =>
                      setNewRateLimit({
                        ...newRateLimit,
                        period: e.target.value as RateLimit['period'],
                      })
                    }
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="SECOND">Second</option>
                    <option value="MINUTE">Minute</option>
                    <option value="HOUR">Hour</option>
                    <option value="DAY">Day</option>
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
                <Button onClick={handleCreateRateLimit}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              placeholder="Search rate limits..."
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
              <div className="text-2xl font-bold">{rateLimits.length}</div>
              <p className="text-sm text-muted-foreground">Total Rate Limits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {rateLimits.filter((limit) => limit.enabled).length}
              </div>
              <p className="text-sm text-muted-foreground">Enabled Limits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {rateLimits.filter((limit) => !limit.enabled).length}
              </div>
              <p className="text-sm text-muted-foreground">Disabled Limits</p>
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
                  <TableHead>Resource</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRateLimits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No rate limits found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRateLimits.map((limit) => (
                    <TableRow key={limit.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                          {limit.name}
                        </div>
                      </TableCell>
                      <TableCell>{limit.resource}</TableCell>
                      <TableCell>{getScopeBadge(limit.type)}</TableCell>
                      <TableCell>{formatPeriod(limit)}</TableCell>
                      <TableCell>{getStatusBadge(limit.enabled)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(limit.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleRateLimitStatus(limit.id)}
                            title={limit.enabled ? 'Disable' : 'Enable'}
                          >
                            {limit.enabled ? (
                              <Lock className="h-4 w-4 text-green-600" />
                            ) : (
                              <Lock className="h-4 w-4 text-red-600" />
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
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleRateLimitStatus(limit.id)}
                              >
                                <Lock className="h-4 w-4 mr-2" />
                                {limit.enabled ? 'Disable' : 'Enable'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => deleteRateLimit(limit.id)}
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
      </div>
    </div>
  );
}
