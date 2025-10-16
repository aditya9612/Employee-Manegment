import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  CalendarDays,
  ClipboardList,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Award,
  Target,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats = {
    tasksAssigned: 8,
    tasksCompleted: 5,
    tasksPending: 3,
    leavesAvailable: 12,
    leavesTaken: 3,
    attendancePercentage: 95,
    currentMonthHours: 168,
  };

  const myTasks = [
    { id: 1, title: 'Complete API Integration', priority: 'high', dueDate: 'Today', progress: 80, status: 'in-progress' },
    { id: 2, title: 'Update Documentation', priority: 'medium', dueDate: 'Tomorrow', progress: 40, status: 'in-progress' },
    { id: 3, title: 'Code Review - PR #234', priority: 'high', dueDate: 'Today', progress: 100, status: 'completed' },
    { id: 4, title: 'Bug Fix - Login Issue', priority: 'urgent', dueDate: 'Today', progress: 20, status: 'todo' },
  ];

  const recentActivities = [
    { id: 1, action: 'Completed task', description: 'Code Review - PR #234', time: '1 hour ago', type: 'success' },
    { id: 2, action: 'Checked in', description: 'On time at 09:00 AM', time: '3 hours ago', type: 'info' },
    { id: 3, action: 'Leave approved', description: 'Casual leave on 15th Oct', time: 'Yesterday', type: 'success' },
    { id: 4, action: 'New task assigned', description: 'Bug Fix - Login Issue', time: '2 days ago', type: 'warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t.common.welcome}, {user?.name}!</h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button onClick={() => navigate('/employee/attendance')} className="gap-2">
          <Clock className="h-4 w-4" />
          Mark Attendance
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Tasks
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasksAssigned}</div>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3 text-success" />
              <span className="text-xs text-success">{stats.tasksCompleted} completed</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance Rate
            </CardTitle>
            <Target className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendancePercentage}%</div>
            <Progress value={stats.attendancePercentage} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leaves Available
            </CardTitle>
            <CalendarDays className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leavesAvailable}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">{stats.leavesTaken} used this year</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Work Hours (This Month)
            </CardTitle>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentMonthHours}h</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success">On track</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              My Tasks
            </CardTitle>
            <CardDescription>Your current assignments and progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {myTasks.map((task) => (
              <div key={task.id} className="p-3 rounded-lg border space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{task.title}</p>
                      <Badge 
                        variant={
                          task.priority === 'urgent' ? 'destructive' :
                          task.priority === 'high' ? 'default' :
                          'secondary'
                        }
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Due: {task.dueDate}</p>
                  </div>
                  <Badge 
                    variant={
                      task.status === 'completed' ? 'default' :
                      task.status === 'in-progress' ? 'outline' :
                      'secondary'
                    }
                  >
                    {task.status}
                  </Badge>
                </div>
                {task.status !== 'completed' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-1" />
                  </div>
                )}
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => navigate('/employee/tasks')}>
              View All Tasks
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your recent updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'success' ? 'bg-success/10' :
                  activity.type === 'warning' ? 'bg-warning/10' :
                  'bg-info/10'
                }`}>
                  {activity.type === 'success' && <CheckCircle2 className="h-4 w-4 text-success" />}
                  {activity.type === 'warning' && <AlertCircle className="h-4 w-4 text-warning" />}
                  {activity.type === 'info' && <Activity className="h-4 w-4 text-info" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.quickActions}</CardTitle>
          <CardDescription>Frequently used actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/employee/attendance')}>
              <Clock className="h-5 w-5" />
              <span className="text-xs">Attendance</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/employee/leaves')}>
              <CalendarDays className="h-5 w-5" />
              <span className="text-xs">Apply Leave</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/employee/tasks')}>
              <ClipboardList className="h-5 w-5" />
              <span className="text-xs">My Tasks</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/employee/profile')}>
              <Award className="h-5 w-5" />
              <span className="text-xs">My Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;