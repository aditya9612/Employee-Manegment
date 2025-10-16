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
  AlertCircle,
  ChevronRight,
  Activity,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeamLeadDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats = {
    teamSize: 8,
    presentToday: 7,
    onLeave: 1,
    tasksInProgress: 12,
    completedToday: 5,
    pendingReviews: 3,
    teamEfficiency: 85,
  };

  const teamMembers = [
    { name: 'John Doe', status: 'present', task: 'Feature Development', progress: 75 },
    { name: 'Jane Smith', status: 'present', task: 'Bug Fixes', progress: 90 },
    { name: 'Mike Johnson', status: 'on-leave', task: 'Code Review', progress: 0 },
    { name: 'Sarah Wilson', status: 'present', task: 'Testing', progress: 60 },
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'Completed task', time: '10 mins ago', type: 'success' },
    { id: 2, user: 'Jane Smith', action: 'Started new task', time: '25 mins ago', type: 'info' },
    { id: 3, user: 'Sarah Wilson', action: 'Checked in', time: '2 hours ago', type: 'success' },
    { id: 4, user: 'Mike Johnson', action: 'On leave', time: 'Today', type: 'warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t.common.welcome}, Team Lead!</h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button onClick={() => navigate('/team_lead/tasks')} className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Assign Task
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Size
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamSize}</div>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3 text-success" />
              <span className="text-xs text-success">{stats.presentToday} present</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Efficiency
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamEfficiency}%</div>
            <Progress value={stats.teamEfficiency} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasks In Progress
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasksInProgress}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">{stats.completedToday} completed today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Reviews
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <Button variant="link" className="p-0 h-auto mt-1" onClick={() => navigate('/team_lead/tasks')}>
              <span className="text-xs">Review now</span>
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Member Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>Current status and task progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.name} className="p-3 rounded-lg border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      member.status === 'present' ? 'bg-success' : 'bg-warning'
                    }`} />
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.task}</p>
                    </div>
                  </div>
                  <Badge variant={member.status === 'present' ? 'default' : 'secondary'}>
                    {member.status === 'present' ? 'Active' : 'On Leave'}
                  </Badge>
                </div>
                {member.status === 'present' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{member.progress}%</span>
                    </div>
                    <Progress value={member.progress} className="h-1" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest team updates</CardDescription>
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
                  <p className="text-sm font-medium">{activity.user}</p>
                  <p className="text-xs text-muted-foreground">{activity.action}</p>
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
          <CardDescription>Frequently used team lead actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/team_lead/teams')}>
              <Users className="h-5 w-5" />
              <span className="text-xs">View Team</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/team_lead/attendance')}>
              <Clock className="h-5 w-5" />
              <span className="text-xs">Team Attendance</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/team_lead/leaves')}>
              <CalendarDays className="h-5 w-5" />
              <span className="text-xs">Leave Requests</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate('/team_lead/tasks')}>
              <ClipboardList className="h-5 w-5" />
              <span className="text-xs">Manage Tasks</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamLeadDashboard;