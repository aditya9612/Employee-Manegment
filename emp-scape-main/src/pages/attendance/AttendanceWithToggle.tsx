import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AttendanceCamera from '@/components/attendance/AttendanceCamera';
import { Clock, MapPin, Calendar, LogIn, LogOut, FileText, CheckCircle, AlertCircle, Users, Filter } from 'lucide-react';
import { AttendanceRecord, UserRole } from '@/types';
import { format } from 'date-fns';

const AttendanceWithToggle: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'self' | 'employee'>('self');
  const [showCamera, setShowCamera] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(true);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [todaysWork, setTodaysWork] = useState('');
  const [workPdf, setWorkPdf] = useState<File | null>(null);
  const [currentAttendance, setCurrentAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [employeeAttendanceData, setEmployeeAttendanceData] = useState<AttendanceRecord[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');

  // Determine if user can view employee attendance
  const canViewEmployeeAttendance = user?.role && ['admin', 'hr', 'manager'].includes(user.role);

  // Access rules for attendance viewing
  const getViewableRoles = (): UserRole[] => {
    if (user?.role === 'admin') return ['admin', 'hr', 'manager', 'team_lead', 'employee'];
    if (user?.role === 'hr') return ['hr', 'manager', 'team_lead', 'employee'];
    if (user?.role === 'manager') return ['team_lead', 'employee'];
    return [];
  };

  useEffect(() => {
    loadTodaysAttendance();
    loadAttendanceHistory();
    getCurrentLocation();
    if (viewMode === 'employee' && canViewEmployeeAttendance) {
      loadEmployeeAttendance();
    }
  }, [viewMode]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: ''
          };
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${loc.latitude}&lon=${loc.longitude}&format=json`
            );
            const data = await response.json();
            loc.address = data.display_name || 'Location captured';
          } catch (error) {
            loc.address = `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
          }
          
          setLocation(loc);
        },
        (error) => {
          toast({
            title: 'Location Error',
            description: t.attendance.locationRequired,
            variant: 'destructive',
          });
        }
      );
    }
  };

  const loadTodaysAttendance = () => {
    const storedAttendance = localStorage.getItem(`attendance_${user?.id}_${format(new Date(), 'yyyy-MM-dd')}`);
    if (storedAttendance) {
      setCurrentAttendance(JSON.parse(storedAttendance));
    }
  };

  const loadAttendanceHistory = () => {
    const history = localStorage.getItem(`attendance_history_${user?.id}`);
    if (history) {
      setAttendanceHistory(JSON.parse(history));
    }
  };

  const loadEmployeeAttendance = () => {
    // Mock data for employee attendance - In production, fetch from API
    const mockData: AttendanceRecord[] = [
      {
        id: 'att_1',
        userId: 'emp_001',
        date: selectedDate,
        checkInTime: '09:00:00',
        checkOutTime: '18:30:00',
        checkInLocation: { latitude: 0, longitude: 0, address: 'Office' },
        checkInSelfie: '',
        status: 'present',
        workHours: 9.5,
      },
      {
        id: 'att_2',
        userId: 'emp_002',
        date: selectedDate,
        checkInTime: '09:45:00',
        checkOutTime: '18:00:00',
        checkInLocation: { latitude: 0, longitude: 0, address: 'Office' },
        checkInSelfie: '',
        status: 'late',
        workHours: 8.25,
      },
      {
        id: 'att_3',
        userId: 'emp_003',
        date: selectedDate,
        checkInTime: '09:15:00',
        checkOutTime: '17:00:00',
        checkInLocation: { latitude: 0, longitude: 0, address: 'Office' },
        checkInSelfie: '',
        status: 'present',
        workHours: 7.75,
      },
    ];
    setEmployeeAttendanceData(mockData);
  };

  const handleCheckIn = () => {
    if (!location) {
      toast({
        title: 'Error',
        description: t.attendance.locationRequired,
        variant: 'destructive',
      });
      return;
    }
    setIsCheckingIn(true);
    setShowCamera(true);
  };

  const handleCheckOut = () => {
    if (!location) {
      toast({
        title: 'Error',
        description: t.attendance.locationRequired,
        variant: 'destructive',
      });
      return;
    }
    setShowCheckoutDialog(true);
  };

  const confirmCheckOut = () => {
    setIsCheckingIn(false);
    setShowCamera(true);
    setShowCheckoutDialog(false);
  };

  const handleCameraCapture = async (imageData: string) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const now = new Date();
      const timeString = format(now, 'HH:mm:ss');
      const dateString = format(now, 'yyyy-MM-dd');
      
      if (isCheckingIn) {
        const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
        
        const newAttendance: AttendanceRecord = {
          id: `att_${Date.now()}`,
          userId: user?.id || '',
          date: dateString,
          checkInTime: timeString,
          checkInLocation: location!,
          checkInSelfie: imageData,
          status: isLate ? 'late' : 'present',
          remarks: isLate ? 'Late arrival' : undefined
        };
        
        setCurrentAttendance(newAttendance);
        localStorage.setItem(`attendance_${user?.id}_${dateString}`, JSON.stringify(newAttendance));
        
        toast({
          title: 'Success',
          description: `${t.attendance.checkedIn} at ${timeString}${isLate ? ' (Late)' : ''}`,
        });
      } else {
        if (currentAttendance) {
          const isEarly = now.getHours() < 18;
          const checkInTime = new Date(`${dateString} ${currentAttendance.checkInTime}`);
          const workHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
          
          const updatedAttendance: AttendanceRecord = {
            ...currentAttendance,
            checkOutTime: timeString,
            checkOutLocation: location!,
            checkOutSelfie: imageData,
            workHours: parseFloat(workHours.toFixed(2)),
            remarks: isEarly ? 'Early departure' : currentAttendance.remarks
          };
          
          setCurrentAttendance(updatedAttendance);
          
          const history = [...attendanceHistory, updatedAttendance];
          setAttendanceHistory(history);
          localStorage.setItem(`attendance_${user?.id}_${dateString}`, JSON.stringify(updatedAttendance));
          localStorage.setItem(`attendance_history_${user?.id}`, JSON.stringify(history));
          
          toast({
            title: 'Success',
            description: `${t.attendance.checkedOut} at ${timeString}${isEarly ? ' (Early)' : ''}`,
          });
        }
      }
      
      setShowCamera(false);
      setIsLoading(false);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setWorkPdf(file);
    } else {
      toast({
        title: 'Error',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string, checkInTime?: string, checkOutTime?: string) => {
    if (status === 'late' || checkInTime && checkInTime > '09:30:00') {
      return <Badge variant="destructive">Late</Badge>;
    }
    if (checkOutTime && checkOutTime < '18:00:00') {
      return <Badge variant="outline" className="border-orange-500 text-orange-500">Early</Badge>;
    }
    if (status === 'present') {
      return <Badge variant="default" className="bg-green-500">On Time</Badge>;
    }
    return null;
  };

  const formatIST = (dateString: string, timeString?: string) => {
    if (!timeString) return '-';
    const date = new Date(`${dateString} ${timeString}`);
    return date.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (showCamera) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {isCheckingIn ? t.attendance.checkIn : t.attendance.checkOut}
          </h2>
        </div>
        <AttendanceCamera
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
        {isLoading && (
          <div className="text-center">
            <p className="text-muted-foreground animate-pulse">Recognizing face...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.navigation.attendance}</h2>
        <div className="flex items-center gap-4">
          {canViewEmployeeAttendance && (
            <div className="flex items-center space-x-2">
              <Switch
                id="view-mode"
                checked={viewMode === 'employee'}
                onCheckedChange={(checked) => setViewMode(checked ? 'employee' : 'self')}
              />
              <Label htmlFor="view-mode" className="cursor-pointer">
                {viewMode === 'self' ? 'Self Attendance' : 'Employee Attendance'}
              </Label>
            </div>
          )}
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Calendar className="h-4 w-4 mr-2" />
            {format(new Date(), 'dd MMM yyyy')}
          </Badge>
        </div>
      </div>

      {viewMode === 'self' ? (
        <>
          {/* Self Attendance View */}
          <Card>
            <CardHeader>
              <CardTitle>{t.attendance.todayStatus}</CardTitle>
              <CardDescription>Your attendance status for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {location && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span className="flex-1">{location.address}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentAttendance ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <LogIn className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Check-in Time</span>
                          {getStatusBadge(currentAttendance.status, currentAttendance.checkInTime)}
                        </div>
                        <p className="text-lg font-semibold">
                          {formatIST(currentAttendance.date, currentAttendance.checkInTime)}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <LogOut className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">Check-out Time</span>
                          {currentAttendance.checkOutTime && 
                            getStatusBadge(currentAttendance.status, undefined, currentAttendance.checkOutTime)}
                        </div>
                        <p className="text-lg font-semibold">
                          {currentAttendance.checkOutTime 
                            ? formatIST(currentAttendance.date, currentAttendance.checkOutTime)
                            : '-'}
                        </p>
                      </div>
                      
                      {currentAttendance.workHours && (
                        <div className="col-span-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Total Work Hours</span>
                          </div>
                          <p className="text-lg font-semibold">{currentAttendance.workHours} hours</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Not checked in yet</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  {!currentAttendance ? (
                    <Button onClick={handleCheckIn} size="lg" className="flex-1">
                      <LogIn className="h-5 w-5 mr-2" />
                      {t.attendance.checkIn}
                    </Button>
                  ) : !currentAttendance.checkOutTime ? (
                    <Button onClick={handleCheckOut} size="lg" variant="destructive" className="flex-1">
                      <LogOut className="h-5 w-5 mr-2" />
                      {t.attendance.checkOut}
                    </Button>
                  ) : (
                    <div className="flex-1 text-center">
                      <Badge variant="outline" className="px-4 py-2">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Attendance Completed for Today
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance History */}
          <Card>
            <CardHeader>
              <CardTitle>{t.attendance.history}</CardTitle>
              <CardDescription>Your recent attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceHistory.length > 0 ? (
                  attendanceHistory.slice(-10).reverse().map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{format(new Date(record.date), 'dd MMM yyyy')}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>In: {formatIST(record.date, record.checkInTime)}</span>
                            <span>Out: {formatIST(record.date, record.checkOutTime)}</span>
                            {record.workHours && <span>{record.workHours}h</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(record.status, record.checkInTime, record.checkOutTime)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No attendance history</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Employee Attendance View */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Attendance
              </CardTitle>
              <CardDescription>View and manage team attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="date-filter">Date</Label>
                    <Input
                      id="date-filter"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        loadEmployeeAttendance();
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="role-filter">Role Filter</Label>
                    <Select value={filterRole} onValueChange={(value: any) => setFilterRole(value)}>
                      <SelectTrigger id="role-filter" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {getViewableRoles().map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Work Hours</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeeAttendanceData.length > 0 ? (
                        employeeAttendanceData.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.userId}</TableCell>
                            <TableCell>{format(new Date(record.date), 'dd MMM yyyy')}</TableCell>
                            <TableCell>{formatIST(record.date, record.checkInTime)}</TableCell>
                            <TableCell>{formatIST(record.date, record.checkOutTime)}</TableCell>
                            <TableCell>{record.workHours || '-'} h</TableCell>
                            <TableCell>
                              {getStatusBadge(record.status, record.checkInTime, record.checkOutTime)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {record.checkInLocation.address || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No attendance records found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Checkout Confirmation Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Check-out</DialogTitle>
            <DialogDescription>
              You can optionally add today's work report before checking out.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="work-summary">Today's Work Summary (Optional)</Label>
              <Input
                id="work-summary"
                placeholder="Brief description of today's work..."
                value={todaysWork}
                onChange={(e) => setTodaysWork(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="work-pdf">Upload Work Report PDF (Optional)</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  id="work-pdf"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                />
                {workPdf && (
                  <Badge variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    {workPdf.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckoutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCheckOut}>
              Proceed to Check-out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceWithToggle;