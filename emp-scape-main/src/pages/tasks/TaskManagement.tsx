import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Task, UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Pause, 
  PlayCircle,
  Calendar,
  User,
  Filter,
  Search,
  MessageSquare,
  Paperclip,
  ChevronRight,
  ListTodo,
  Grid3x3
} from 'lucide-react';
import { format } from 'date-fns';

// Mock data for demo
const mockEmployees = {
  admin: [],
  hr: ['employee@company.com', 'teamlead@company.com', 'manager@company.com'],
  manager: ['employee@company.com', 'teamlead@company.com'],
  team_lead: ['employee@company.com'],
  employee: []
};

const TaskManagement: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: [] as string[],
    priority: 'medium' as Task['priority'],
    deadline: '',
    department: '',
    employeeId: ''
  });

  // Load mock tasks
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      // Generate mock tasks
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Complete Project Documentation',
          description: 'Prepare comprehensive documentation for the new employee management system',
          assignedTo: ['employee@company.com'],
          assignedBy: user?.id || '1',
          priority: 'high',
          status: 'in-progress',
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          startDate: new Date().toISOString(),
          tags: ['documentation', 'urgent'],
          progress: 60,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Team Meeting Preparation',
          description: 'Prepare agenda and materials for quarterly team meeting',
          assignedTo: ['teamlead@company.com'],
          assignedBy: user?.id || '1',
          priority: 'medium',
          status: 'todo',
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          startDate: new Date().toISOString(),
          tags: ['meeting', 'planning'],
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setTasks(mockTasks);
      localStorage.setItem('tasks', JSON.stringify(mockTasks));
    }
  }, [user]);

  // Check if user can assign tasks to others
  const canAssignTasks = () => {
    if (!user) return false;
    return user.role !== 'employee';
  };

  // Get assignable users based on role
  const getAssignableUsers = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'admin':
        return [...mockEmployees.hr, ...mockEmployees.manager, ...mockEmployees.team_lead, ...mockEmployees.employee];
      case 'hr':
        return [...mockEmployees.manager, ...mockEmployees.team_lead, ...mockEmployees.employee];
      case 'manager':
        return [...mockEmployees.team_lead, ...mockEmployees.employee];
      case 'team_lead':
        return mockEmployees.employee;
      default:
        return [];
    }
  };

  // Filter tasks based on search and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    
    // Role-based task visibility
    const isVisible = user && (
      task.assignedBy === user.id ||
      task.assignedTo.includes(user.email || '') ||
      user.role === 'admin' ||
      (user.role === 'hr' && task.assignedBy !== '1') ||
      (user.role === 'manager' && !['1', '2'].includes(task.assignedBy))
    );
    
    return matchesSearch && matchesStatus && isVisible;
  });

  // Create new task
  const handleCreateTask = () => {
    if (!user) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo.length > 0 ? newTask.assignedTo : [user.email],
      assignedBy: user.id,
      priority: newTask.priority,
      status: 'todo',
      deadline: newTask.deadline,
      startDate: new Date().toISOString(),
      tags: [],
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    // Send notification to assignee if task is assigned to someone else
    if (task.assignedTo.length > 0 && task.assignedTo[0] !== user.email && task.assignedTo[0] !== 'self') {
      addNotification({
        title: 'New Task Assigned',
        message: `${user.name} assigned you a new task: "${task.title}"`,
        type: 'task',
        actionUrl: '/tasks',
        metadata: {
          taskId: task.id,
          requesterId: user.id,
          requesterName: user.name,
        }
      });
    }
    
    toast({
      title: 'Task Created',
      description: `Task "${task.title}" has been created successfully.`,
    });

    setIsCreateDialogOpen(false);
    setNewTask({
      title: '',
      description: '',
      assignedTo: [],
      priority: 'medium',
      deadline: '',
      department: '',
      employeeId: ''
    });
  };

  // Update task status
  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus,
            completedDate: newStatus === 'completed' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString()
          } 
        : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    toast({
      title: 'Status Updated',
      description: `Task status changed to ${newStatus}.`,
    });
  };

  // Get status color
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'bg-slate-500';
      case 'in-progress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.navigation.tasks}</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all tasks across your organization
          </p>
        </div>
        
        {canAssignTasks() && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Assign a new task to team members
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value: Task['priority']) => 
                        setNewTask({ ...newTask, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newTask.deadline}
                      onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    />
                  </div>
                </div>
                
                {getAssignableUsers().length > 0 && (
                  <div>
                    <Label htmlFor="assignTo">Assign To</Label>
                    <Select
                      value={newTask.assignedTo[0] || ''}
                      onValueChange={(value) => 
                        setNewTask({ ...newTask, assignedTo: [value] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Self</SelectItem>
                        {getAssignableUsers().map(email => (
                          <SelectItem key={email} value={email}>
                            {email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newTask.department}
                      onChange={(e) => setNewTask({ ...newTask, department: e.target.value })}
                      placeholder="Enter department"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      value={newTask.employeeId}
                      onChange={(e) => setNewTask({ ...newTask, employeeId: e.target.value })}
                      placeholder="Enter employee ID"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateTask}
                    disabled={!newTask.title || !newTask.description}
                  >
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'in-progress').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => 
                t.status !== 'completed' && 
                new Date(t.deadline) < new Date()
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Task Management</CardTitle>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 w-[200px]"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <ListTodo className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {viewMode === 'list' ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {task.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {task.assignedTo[0] || 'Self'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {format(new Date(task.deadline), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={task.status}
                            onValueChange={(value: Task['status']) => 
                              updateTaskStatus(task.id, value)
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-slate-500" />
                                  To Do
                                </div>
                              </SelectItem>
                              <SelectItem value="in-progress">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                                  In Progress
                                </div>
                              </SelectItem>
                              <SelectItem value="review">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                  Review
                                </div>
                              </SelectItem>
                              <SelectItem value="completed">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-500" />
                                  Completed
                                </div>
                              </SelectItem>
                              <SelectItem value="cancelled">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-red-500" />
                                  Cancelled
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTask(task)}
                          >
                            View
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedTask(task)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {task.description}
                        </CardDescription>
                      </div>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{task.assignedTo[0] || 'Self'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(task.deadline), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(task.status)}`} />
                          <span className="text-sm capitalize">{task.status.replace('-', ' ')}</span>
                        </div>
                        {task.progress !== undefined && (
                          <span className="text-sm text-muted-foreground">{task.progress}%</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Detail Dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedTask.title}</DialogTitle>
              <DialogDescription>
                Task ID: {selectedTask.id}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedTask.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Assigned To</h4>
                    <p className="text-muted-foreground">{selectedTask.assignedTo[0] || 'Self'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Priority</h4>
                    <Badge className={getPriorityColor(selectedTask.priority)}>
                      {selectedTask.priority}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Deadline</h4>
                    <p className="text-muted-foreground">
                      {format(new Date(selectedTask.deadline), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Status</h4>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(selectedTask.status)}`} />
                      <span className="capitalize">{selectedTask.status.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>
                
                {selectedTask.tags && selectedTask.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex gap-2">
                      {selectedTask.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="activity">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <PlayCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Task Created</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(selectedTask.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  {selectedTask.completedDate && (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Task Completed</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(selectedTask.completedDate), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="comments">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Textarea placeholder="Add a comment..." rows={3} />
                    <Button>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TaskManagement;