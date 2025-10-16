import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar as CalendarIcon,
  User,
  FileText,
  Timer
} from 'lucide-react';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: 'annual' | 'sick' | 'casual' | 'maternity' | 'paternity' | 'unpaid';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  comments?: string;
  requestDate: Date;
}

export default function LeaveManagement() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      department: 'Engineering',
      type: 'annual',
      startDate: new Date(2024, 0, 15),
      endDate: new Date(2024, 0, 17),
      reason: 'Family vacation',
      status: 'pending',
      requestDate: new Date(2024, 0, 10)
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      department: 'Marketing',
      type: 'sick',
      startDate: new Date(2024, 0, 20),
      endDate: new Date(2024, 0, 21),
      reason: 'Medical appointment',
      status: 'approved',
      approvedBy: 'Manager',
      requestDate: new Date(2024, 0, 18)
    }
  ]);

  const [formData, setFormData] = useState({
    type: 'annual',
    startDate: new Date(),
    endDate: new Date(),
    reason: ''
  });

  const leaveBalance = {
    annual: 15,
    sick: 10,
    casual: 5,
    used: {
      annual: 3,
      sick: 2,
      casual: 1
    }
  };

  const canApproveLeaves = ['admin', 'hr', 'manager'].includes(user?.role || '');
  const canViewTeamLeaves = ['team_lead'].includes(user?.role || '');

  const handleSubmitRequest = () => {
    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      employeeId: user?.id || '',
      employeeName: user?.name || '',
      department: user?.department || '',
      type: formData.type as LeaveRequest['type'],
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'pending',
      requestDate: new Date()
    };

    setLeaveRequests([...leaveRequests, newRequest]);
    
    // Send notification to approver based on hierarchy
    const getSuperiorRole = () => {
      switch (user?.role) {
        case 'employee': return 'team_lead';
        case 'team_lead': return 'manager';
        case 'manager': return 'hr';
        case 'hr': return 'admin';
        default: return null;
      }
    };
    
    const superiorRole = getSuperiorRole();
    if (superiorRole) {
      addNotification({
        title: 'New Leave Request',
        message: `${user?.name} has requested ${formData.type} leave from ${format(formData.startDate, 'MMM dd')} to ${format(formData.endDate, 'MMM dd')}`,
        type: 'leave',
        actionUrl: `/${superiorRole}/leaves`,
        metadata: {
          leaveId: newRequest.id,
          requesterId: user?.id,
          requesterName: user?.name,
        }
      });
    }
    
    toast({
      title: 'Success',
      description: 'Leave request submitted successfully'
    });
    
    // Reset form
    setFormData({
      type: 'annual',
      startDate: new Date(),
      endDate: new Date(),
      reason: ''
    });
  };

  const handleApproveReject = (id: string, status: 'approved' | 'rejected') => {
    const request = leaveRequests.find(req => req.id === id);
    
    setLeaveRequests(leaveRequests.map(req => 
      req.id === id 
        ? { ...req, status, approvedBy: user?.name }
        : req
    ));
    
    // Notify the requester
    if (request) {
      addNotification({
        title: `Leave Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your ${request.type} leave request has been ${status} by ${user?.name}`,
        type: 'leave',
        actionUrl: `/${request.department.toLowerCase()}/leaves`,
        metadata: {
          leaveId: id,
        }
      });
    }
    
    toast({
      title: 'Success',
      description: `Leave request ${status}`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'casual': return 'bg-green-100 text-green-800';
      case 'maternity': return 'bg-purple-100 text-purple-800';
      case 'paternity': return 'bg-indigo-100 text-indigo-800';
      case 'unpaid': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter requests based on role
  const getFilteredRequests = () => {
    if (user?.role === 'admin') {
      return leaveRequests;
    } else if (user?.role === 'hr') {
      return leaveRequests.filter(req => 
        ['manager', 'team_lead', 'employee'].includes(req.department.toLowerCase())
      );
    } else if (user?.role === 'manager') {
      return leaveRequests.filter(req => 
        ['team_lead', 'employee'].includes(req.department.toLowerCase())
      );
    } else if (user?.role === 'team_lead') {
      return leaveRequests.filter(req => 
        req.department.toLowerCase() === 'employee'
      );
    }
    return leaveRequests.filter(req => req.employeeId === user?.id);
  };


  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs defaultValue="request" className="w-full">
        <TabsList className={`grid w-full ${(canApproveLeaves || canViewTeamLeaves) ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="request">Apply Leave</TabsTrigger>
          {(canApproveLeaves || canViewTeamLeaves) && (
            <TabsTrigger value="approvals">
              {canApproveLeaves ? 'Approvals' : 'Team Leaves'}
            </TabsTrigger>
          )}
          <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-4">
          {/* Leave Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Leave</p>
                    <p className="text-2xl font-bold">
                      {leaveBalance.annual - leaveBalance.used.annual}/{leaveBalance.annual}
                    </p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sick Leave</p>
                    <p className="text-2xl font-bold">
                      {leaveBalance.sick - leaveBalance.used.sick}/{leaveBalance.sick}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Casual Leave</p>
                    <p className="text-2xl font-bold">
                      {leaveBalance.casual - leaveBalance.used.casual}/{leaveBalance.casual}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leave Request Form */}
          <Card>
            <CardHeader>
              <CardTitle>Request Leave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Leave Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({...formData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="maternity">Maternity Leave</SelectItem>
                      <SelectItem value="paternity">Paternity Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={format(formData.startDate, 'yyyy-MM-dd')}
                      onChange={(e) => setFormData({...formData, startDate: new Date(e.target.value)})}
                    />
                    <Input
                      type="date"
                      value={format(formData.endDate, 'yyyy-MM-dd')}
                      onChange={(e) => setFormData({...formData, endDate: new Date(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Please provide a reason for your leave request..."
                  rows={3}
                />
              </div>
              <Button onClick={handleSubmitRequest}>Submit Request</Button>
            </CardContent>
          </Card>

          {/* My Leave Requests */}
          <Card>
            <CardHeader>
              <CardTitle>My Leave History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveRequests.filter(req => req.employeeId === user?.id).map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span className="font-medium">
                            {format(request.startDate, 'MMM dd')} - {format(request.endDate, 'MMM dd, yyyy')}
                          </span>
                          <Badge className={getLeaveTypeColor(request.type)}>
                            {request.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                      </div>
                      <Badge variant={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Leave Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {(canApproveLeaves || canViewTeamLeaves) && (
          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <CardTitle>
                  {canApproveLeaves ? 'Leave Approval Requests' : 'Team Leave Requests'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredRequests().map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{request.employeeName}</span>
                            <Badge className={getLeaveTypeColor(request.type)}>
                              {request.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{request.department}</span>
                            <span>
                              {format(request.startDate, 'MMM dd')} - {format(request.endDate, 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <p className="text-sm">{request.reason}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {request.status === 'pending' && canApproveLeaves ? (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApproveReject(request.id, 'approved')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleApproveReject(request.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Badge variant={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}