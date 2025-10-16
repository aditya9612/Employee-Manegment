import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Clock,
  CalendarDays,
  ClipboardList,
  TrendingUp,
  Building,
  AlertCircle,
  ChevronRight,
  Activity,
  Target,
  Award,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats = {
    totalEmployees: 156,
    presentToday: 142,
    onLeave: 8,
    lateArrivals: 6,
    pendingLeaves: 12,
    activeTasks: 45,
    completedTasks: 128,
    departments: 8,
  };

  const recentActivities = [
    { id: 1, type: 'check-in', user: 'John Doe', time: '09:00 AM', status: 'on-time' },
    { id: 2, type: 'leave', user: 'Jane Smith', time: '10:30 AM', status: 'pending' },
    { id: 3, type: 'task', user: 'Mike Johnson', time: '11:00 AM', status: 'completed' },
    { id: 4, type: 'check-in', user: 'Sarah Wilson', time: '09:15 AM', status: 'late' },
  ];

  const departments = [
    { name: 'Engineering', employees: 45, performance: 92 },
    { name: 'Sales', employees: 32, performance: 88 },
    { name: 'Marketing', employees: 28, performance: 85 },
    { name: 'HR', employees: 15, performance: 90 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t.common.welcome}, Admin!</h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button onClick={() => navigate('/admin/employees/new')} className="gap-2">
          <UserPlus className="h-4 w-4" />
          {t.employee.addEmployee}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.dashboard.totalEmployees}
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.dashboard.presentToday}
            </CardTitle>
            <Clock className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentToday}</div>
            <Progress value={(stats.presentToday / stats.totalEmployees) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.dashboard.pendingApprovals}
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
            <Button variant="link" className="p-0 h-auto mt-1" onClick={() => navigate('/admin/leaves')}>
              <span className="text-xs">View all</span>
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tasks
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
            <div className="flex items-center gap-1 mt-1">
              <Activity className="h-3 w-3 text-info" />
              <span className="text-xs text-muted-foreground">{stats.completedTasks} completed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Performance */}
        <Card className="lg:col-span-2 card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Department Performance
            </CardTitle>
            <CardDescription>Performance metrics by department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {departments.map((dept) => (
              <div key={dept.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{dept.employees} employees</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{dept.performance}%</p>
                    <Badge variant={dept.performance >= 90 ? 'default' : 'secondary'} className="text-xs">
                      {dept.performance >= 90 ? 'Excellent' : 'Good'}
                    </Badge>
                  </div>
                </div>
                <Progress value={dept.performance} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t.dashboard.recentActivities}
            </CardTitle>
            <CardDescription>Latest employee activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'check-in' ? 'bg-success/10' :
                  activity.type === 'leave' ? 'bg-warning/10' :
                  'bg-info/10'
                }`}>
                  {activity.type === 'check-in' && <Clock className="h-4 w-4 text-success" />}
                  {activity.type === 'leave' && <CalendarDays className="h-4 w-4 text-warning" />}
                  {activity.type === 'task' && <ClipboardList className="h-4 w-4 text-info" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.user}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.type === 'check-in' && 'Checked in'}
                    {activity.type === 'leave' && 'Applied for leave'}
                    {activity.type === 'task' && 'Completed task'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                  <Badge 
                    variant={
                      activity.status === 'on-time' || activity.status === 'completed' ? 'default' :
                      activity.status === 'pending' ? 'secondary' :
                      'destructive'
                    }
                    className="text-xs mt-1"
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>{t.dashboard.quickActions}</CardTitle>
          <CardDescription>Frequently used administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/admin/employees')}>
              <Users className="h-5 w-5" />
              <span className="text-xs">Manage Employees</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/admin/attendance')}>
              <Clock className="h-5 w-5" />
              <span className="text-xs">View Attendance</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/admin/leaves')}>
              <CalendarDays className="h-5 w-5" />
              <span className="text-xs">Approve Leaves</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/admin/reports')}>
              <Award className="h-5 w-5" />
              <span className="text-xs">Generate Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;