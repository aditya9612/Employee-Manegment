import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Search, Filter, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { AttendanceRecord } from '@/types';
import { format } from 'date-fns';

interface EmployeeAttendance extends AttendanceRecord {
  userName: string;
  userEmail: string;
  department: string;
}

const AttendanceManager: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [attendanceRecords, setAttendanceRecords] = useState<EmployeeAttendance[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<EmployeeAttendance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadAllAttendance();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, filterStatus, filterDate, attendanceRecords]);

  const loadAllAttendance = () => {
    // Demo data for multiple employees
    const demoEmployees = [
      { id: 'emp1', name: 'John Doe', email: 'john@company.com', department: 'Engineering' },
      { id: 'emp2', name: 'Jane Smith', email: 'jane@company.com', department: 'Marketing' },
      { id: 'emp3', name: 'Mike Johnson', email: 'mike@company.com', department: 'Sales' },
      { id: 'emp4', name: 'Sarah Williams', email: 'sarah@company.com', department: 'HR' },
      { id: 'emp5', name: 'Tom Brown', email: 'tom@company.com', department: 'Engineering' },
    ];

    const records: EmployeeAttendance[] = [];
    const today = new Date();
    
    // Generate attendance records for the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = format(date, 'yyyy-MM-dd');
      
      demoEmployees.forEach(emp => {
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isPresent = !isWeekend && Math.random() > 0.1; // 90% attendance rate
        
        if (isPresent) {
          const checkInHour = 8 + Math.floor(Math.random() * 3); // 8-10 AM
          const checkInMinute = Math.floor(Math.random() * 60);
          const checkOutHour = 17 + Math.floor(Math.random() * 3); // 5-7 PM
          const checkOutMinute = Math.floor(Math.random() * 60);
          const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 30);
          const isEarly = checkOutHour < 18;
          
          records.push({
            id: `att_${emp.id}_${dateString}`,
            userId: emp.id,
            userName: emp.name,
            userEmail: emp.email,
            department: emp.department,
            date: dateString,
            checkInTime: `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}:00`,
            checkOutTime: `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}:00`,
            checkInLocation: {
              latitude: 19.0760 + (Math.random() - 0.5) * 0.01,
              longitude: 72.8777 + (Math.random() - 0.5) * 0.01,
              address: 'Mumbai Office'
            },
            checkOutLocation: {
              latitude: 19.0760 + (Math.random() - 0.5) * 0.01,
              longitude: 72.8777 + (Math.random() - 0.5) * 0.01,
              address: 'Mumbai Office'
            },
            checkInSelfie: '',
            checkOutSelfie: '',
            workHours: checkOutHour - checkInHour,
            status: isLate ? 'late' : 'present',
            remarks: isLate ? 'Late arrival' : isEarly ? 'Early departure' : undefined
          });
        }
      });
    }
    
    setAttendanceRecords(records);
  };

  const filterRecords = () => {
    let filtered = [...attendanceRecords];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => {
        if (filterStatus === 'late') return record.status === 'late' || (record.checkInTime && record.checkInTime > '09:30:00');
        if (filterStatus === 'early') return record.checkOutTime && record.checkOutTime < '18:00:00';
        if (filterStatus === 'present') return record.status === 'present';
        return true;
      });
    }
    
    // Filter by date
    if (filterDate) {
      filtered = filtered.filter(record => record.date === filterDate);
    }
    
    setFilteredRecords(filtered);
  };

  const getStatusBadge = (record: EmployeeAttendance) => {
    const badges = [];
    
    if (record.status === 'late' || (record.checkInTime && record.checkInTime > '09:30:00')) {
      badges.push(<Badge key="late" variant="destructive" className="text-xs">Late</Badge>);
    }
    if (record.checkOutTime && record.checkOutTime < '18:00:00') {
      badges.push(<Badge key="early" variant="outline" className="border-orange-500 text-orange-500 text-xs">Early</Badge>);
    }
    if (badges.length === 0 && record.status === 'present') {
      badges.push(<Badge key="ontime" variant="default" className="bg-green-500 text-xs">On Time</Badge>);
    }
    
    return badges;
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

  const exportToCSV = () => {
    const headers = ['Employee', 'Email', 'Department', 'Date', 'Check In', 'Check Out', 'Hours', 'Status'];
    const rows = filteredRecords.map(record => [
      record.userName,
      record.userEmail,
      record.department,
      format(new Date(record.date), 'dd MMM yyyy'),
      formatIST(record.date, record.checkInTime),
      formatIST(record.date, record.checkOutTime),
      record.workHours || '-',
      record.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${filterDate}.csv`;
    a.click();
  };

  const todayStats = {
    total: new Set(attendanceRecords.filter(r => r.date === filterDate).map(r => r.userId)).size,
    present: filteredRecords.filter(r => r.date === filterDate).length,
    late: filteredRecords.filter(r => r.date === filterDate && (r.status === 'late' || (r.checkInTime && r.checkInTime > '09:30:00'))).length,
    early: filteredRecords.filter(r => r.date === filterDate && r.checkOutTime && r.checkOutTime < '18:00:00').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Employee Attendance</h2>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{todayStats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{todayStats.late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Early Departures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{todayStats.early}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>View and manage employee attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">On Time</SelectItem>
                <SelectItem value="late">Late Arrivals</SelectItem>
                <SelectItem value="early">Early Departures</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-[180px]"
            />
          </div>

          {/* Attendance Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Employee</th>
                    <th className="text-left p-3 font-medium">Department</th>
                    <th className="text-left p-3 font-medium">Check In</th>
                    <th className="text-left p-3 font-medium">Check Out</th>
                    <th className="text-left p-3 font-medium">Hours</th>
                    <th className="text-left p-3 font-medium">Location</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{record.userName}</p>
                            <p className="text-sm text-muted-foreground">{record.userEmail}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{record.department}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-500" />
                            <span>{formatIST(record.date, record.checkInTime)}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-500" />
                            <span>{formatIST(record.date, record.checkOutTime)}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {record.workHours ? (
                            <Badge variant="secondary">{record.workHours}h</Badge>
                          ) : '-'}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{record.checkInLocation.address}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {getStatusBadge(record)}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No attendance records found for the selected date</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceManager;