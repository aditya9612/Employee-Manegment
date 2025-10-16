import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Clock,
  CalendarDays,
  ClipboardList,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Activity,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats = {
    teamMembers: 24,
    presentToday: 22,
    onLeave: 2,
    activeTasks: 18,
    completedTasks: 45,
    pendingApprovals: 5,
    teamPerformance: 88,
    overdueItems: 3,
  };

  const teamActivities = [
    { id: 1, type: 'task', user: 'Alice Cooper', task: 'Design Review', time: '11:00 AM', status: 'completed' },
    { id: 2, type: 'leave', user: 'Bob Martin', time: '09:30 AM', status: 'pending' },
    { id: 3, type: 'check-in', user: 'Carol White', time: '09:00 AM', status: 'on-time' },
    { id: 4, type: 'task', user: 'Dave Brown', task: 'Backend API', time: '2:30 PM', status: 'in-progress' },
  ];

  const teamLeads = [
    { name: 'Frontend Team', lead: 'Alice Cooper', members: 8, completion: 92 },
    { name: 'Backend Team', lead: 'Bob Martin', members: 10, completion: 85 },
    { name: 'QA Team', lead: 'Carol White', members: 6, completion: 88 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t.common.welcome}, Manager!</h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button onClick={() => navigate('/manager/tasks')} className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Assign Task
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Members
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3 text-success" />
              <span className="text-xs text-success">{stats.presentToday} present today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Performance
            </CardTitle>
            <Target className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamPerformance}%</div>
            <Progress value={stats.teamPerformance} className="mt-2 h-1" />
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
            <Button variant="link" className="p-0 h-auto mt-1" onClick={() => navigate('/manager/tasks')}>
              <span className="text-xs">Manage tasks</span>
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approvals
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">{stats.overdueItems} overdue</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Team Activities
            </CardTitle>
            <CardDescription>Recent updates from your team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'task' ? 'bg-info/10' :
                  activity.type === 'leave' ? 'bg-warning/10' :
                  'bg-success/10'
                }`}>
                  {activity.type === 'task' && <ClipboardList className="h-4 w-4 text-info" />}
                  {activity.type === 'leave' && <CalendarDays className="h-4 w-4 text-warning" />}
                  {activity.type === 'check-in' && <Clock className="h-4 w-4 text-success" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.user}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.type === 'task' && `Working on: ${activity.task}`}
                    {activity.type === 'leave' && 'Applied for leave'}
                    {activity.type === 'check-in' && 'Checked in'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                  <Badge 
                    variant={
                      activity.status === 'completed' || activity.status === 'on-time' ? 'default' :
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

        {/* Team Leads Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Task completion by team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamLeads.map((team) => (
              <div key={team.name} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{team.name}</p>
                    <p className="text-xs text-muted-foreground">{team.lead} • {team.members} members</p>
                  </div>
                  <span className="text-sm font-semibold">{team.completion}%</span>
                </div>
                <Progress value={team.completion} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.quickActions}</CardTitle>
          <CardDescription>Frequently used manager actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/manager/teams')}>
              <Users className="h-5 w-5" />
              <span className="text-xs">View Team</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/manager/attendance')}>
              <Clock className="h-5 w-5" />
              <span className="text-xs">Team Attendance</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/manager/leaves')}>
              <CalendarDays className="h-5 w-5" />
              <span className="text-xs">Approve Leaves</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/manager/tasks')}>
              <ClipboardList className="h-5 w-5" />
              <span className="text-xs">Manage Tasks</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;