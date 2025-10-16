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
  AlertCircle,
  ChevronRight,
  Activity,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HRDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats = {
    totalEmployees: 156,
    presentToday: 142,
    onLeave: 8,
    lateArrivals: 6,
    pendingLeaves: 12,
    newJoinersThisMonth: 4,
    exitingThisMonth: 2,
    openPositions: 8,
  };

  const recentActivities = [
    { id: 1, type: 'leave', user: 'Jane Smith', time: '10:30 AM', status: 'pending' },
    { id: 2, type: 'join', user: 'Mike Johnson', time: 'Today', status: 'new-joiner' },
    { id: 3, type: 'document', user: 'Sarah Wilson', time: '2:00 PM', status: 'submitted' },
    { id: 4, type: 'leave', user: 'Tom Anderson', time: '3:15 PM', status: 'approved' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t.common.welcome}, HR!</h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button onClick={() => navigate('/hr/employees')} className="gap-2">
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
              <span className="text-xs text-success">+{stats.newJoinersThisMonth} new this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.dashboard.presentToday}
            </CardTitle>
            <UserCheck className="h-5 w-5 text-success" />
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
            <Button variant="link" className="p-0 h-auto mt-1" onClick={() => navigate('/hr/leaves')}>
              <span className="text-xs">Review requests</span>
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Positions
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openPositions}</div>
            <div className="flex items-center gap-1 mt-1">
              <Activity className="h-3 w-3 text-info" />
              <span className="text-xs text-muted-foreground">Active recruitment</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t.dashboard.recentActivities}
            </CardTitle>
            <CardDescription>Latest HR activities and requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'leave' ? 'bg-warning/10' :
                  activity.type === 'join' ? 'bg-success/10' :
                  'bg-info/10'
                }`}>
                  {activity.type === 'leave' && <CalendarDays className="h-4 w-4 text-warning" />}
                  {activity.type === 'join' && <UserPlus className="h-4 w-4 text-success" />}
                  {activity.type === 'document' && <FileText className="h-4 w-4 text-info" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.user}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.type === 'leave' && 'Applied for leave'}
                    {activity.type === 'join' && 'New employee joined'}
                    {activity.type === 'document' && 'Submitted document'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                  <Badge 
                    variant={
                      activity.status === 'approved' || activity.status === 'new-joiner' ? 'default' :
                      activity.status === 'pending' ? 'secondary' :
                      'outline'
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

        {/* Quick Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Metrics</CardTitle>
            <CardDescription>This month's overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New Joiners</span>
                <span className="font-medium">{stats.newJoinersThisMonth}</span>
              </div>
              <Progress value={(stats.newJoinersThisMonth / 10) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exits</span>
                <span className="font-medium">{stats.exitingThisMonth}</span>
              </div>
              <Progress value={(stats.exitingThisMonth / 10) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">On Leave</span>
                <span className="font-medium">{stats.onLeave}</span>
              </div>
              <Progress value={(stats.onLeave / stats.totalEmployees) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Late Arrivals Today</span>
                <span className="font-medium">{stats.lateArrivals}</span>
              </div>
              <Progress value={(stats.lateArrivals / stats.presentToday) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.quickActions}</CardTitle>
          <CardDescription>Frequently used HR actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/hr/employees')}>
              <Users className="h-5 w-5" />
              <span className="text-xs">Manage Employees</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/hr/attendance')}>
              <Clock className="h-5 w-5" />
              <span className="text-xs">View Attendance</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/hr/leaves')}>
              <CalendarDays className="h-5 w-5" />
              <span className="text-xs">Process Leaves</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/hr/reports')}>
              <FileText className="h-5 w-5" />
              <span className="text-xs">Generate Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRDashboard;