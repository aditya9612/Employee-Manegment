import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Search,
  Users,
  FileSpreadsheet,
  Eye,
  X
} from 'lucide-react';
import { User } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface Employee extends User {
  employeeId: string;
  photoUrl?: string;
  resignationDate?: string;
  gender?: 'male' | 'female' | 'other';
  employeeType?: 'contract' | 'permanent';
  countryCode?: string;
  panCard?: string;
  aadharCard?: string;
  shift?: 'day' | 'night' | 'rotating';
}

export default function EmployeeManagement() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      email: 'john.doe@company.com',
      name: 'John Doe',
      role: 'employee',
      department: 'Engineering',
      designation: 'Software Engineer',
      joiningDate: '2023-01-15',
      phone: '+91-9876543210',
      address: 'Mumbai, Maharashtra',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      resignationDate: undefined,
      gender: 'male',
      employeeType: 'permanent',
      countryCode: '+91',
      panCard: 'ABCDE1234F',
      aadharCard: '1234-5678-9012',
      shift: 'day'
    },
    {
      id: '2',
      employeeId: 'EMP002',
      email: 'jane.smith@company.com',
      name: 'Jane Smith',
      role: 'team_lead',
      department: 'Marketing',
      designation: 'Marketing Lead',
      joiningDate: '2022-06-20',
      phone: '+91-9876543211',
      address: 'Delhi, NCR',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      resignationDate: undefined,
      gender: 'female',
      employeeType: 'permanent',
      countryCode: '+91',
      panCard: 'XYZAB5678G',
      aadharCard: '9876-5432-1098',
      shift: 'day'
    }
  ]);

  const [departments] = useState<string[]>(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    email: '',
    employeeId: '',
    department: '',
    role: 'employee',
    designation: '',
    phone: '',
    address: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'active',
    resignationDate: undefined,
    gender: undefined,
    employeeType: undefined,
    countryCode: '+91',
    panCard: '',
    aadharCard: '',
    shift: undefined
  });

  const [bulkData, setBulkData] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [panCardError, setPanCardError] = useState<string>('');
  const [aadharCardError, setAadharCardError] = useState<string>('');

  const createFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const countryCodes = [
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+1', flag: '🇺🇸', name: 'United States' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+61', flag: '🇦🇺', name: 'Australia' },
    { code: '+81', flag: '🇯🇵', name: 'Japan' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('employees');
    if (saved) {
      try {
        setEmployees(JSON.parse(saved) as Employee[]);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  const filteredEmployees = employees.filter(emp => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = 
      emp.name.toLowerCase().includes(query) ||
      emp.employeeId.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query);
    const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
    const matchesRole = selectedRole === 'all' || emp.role === selectedRole;
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('');
      return true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePhoneNumber = (phone: string, countryCode: string) => {
    if (!phone) {
      setPhoneError('');
      return true;
    }

    const digits = phone.replace(/[^0-9]/g, '');
    
    if (countryCode === '+91') {
      if (digits.length !== 10) {
        setPhoneError('Indian phone numbers must be exactly 10 digits');
        return false;
      }
      const phoneRegex = /^[789]\d{9}$/;
      if (!phoneRegex.test(digits)) {
        setPhoneError('Indian phone numbers must start with 7, 8, or 9 and be exactly 10 digits');
        return false;
      }
    } else if (digits.length > 15) {
      setPhoneError('Phone number cannot exceed 15 digits');
      return false;
    }

    setPhoneError('');
    return true;
  };

  const validatePanCard = (panCard: string) => {
    if (!panCard) {
      setPanCardError('PAN Card is required');
      return false;
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panCard)) {
      setPanCardError('Please enter a valid PAN Card number (e.g., ABCDE1234F)');
      return false;
    }
    setPanCardError('');
    return true;
  };

  const validateAadharCard = (aadharCard: string) => {
    if (!aadharCard) {
      setAadharCardError('Aadhar Card is required');
      return false;
    }
    const aadharRegex = /^\d{4}-\d{4}-\d{4}$/;
    if (!aadharRegex.test(aadharCard)) {
      setAadharCardError('Please enter a valid Aadhar Card number (e.g., 1234-5678-9012)');
      return false;
    }
    setAadharCardError('');
    return true;
  };

  const formatPhoneNumber = (digits: string, countryCode: string) => {
    if (!digits) return '';
    if (countryCode === '+91') {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
  };

  const handlePhoneInput = (value: string, countryCode: string) => {
    const digits = value.replace(/[^0-9]/g, '');
    if (countryCode === '+91' && digits.length > 10) {
      setPhoneError('Indian phone numbers must be exactly 10 digits');
      return formatPhoneNumber(digits.slice(0, 10), countryCode);
    } else if (digits.length > 15) {
      setPhoneError('Phone number cannot exceed 15 digits');
      return formatPhoneNumber(digits.slice(0, 15), countryCode);
    }
    return formatPhoneNumber(digits, countryCode);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateEmployee = () => {
    if (!formData.name || !formData.email || !formData.employeeId || !formData.department || !formData.panCard || !formData.aadharCard || !formData.shift) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: 'Error',
        description: emailError,
        variant: 'destructive'
      });
      return;
    }

    if (!validatePhoneNumber(formData.phone?.replace(/[^0-9]/g, '') || '', formData.countryCode || '+91')) {
      toast({
        title: 'Error',
        description: phoneError,
        variant: 'destructive'
      });
      return;
    }

    if (!validatePanCard(formData.panCard)) {
      toast({
        title: 'Error',
        description: panCardError,
        variant: 'destructive'
      });
      return;
    }

    if (!validateAadharCard(formData.aadharCard)) {
      toast({
        title: 'Error',
        description: aadharCardError,
        variant: 'destructive'
      });
      return;
    }

    const newEmployee: Employee = {
      ...formData as Employee,
      id: Date.now().toString(),
      phone: formData.phone ? `${formData.countryCode || '+91'}-${formData.phone.replace(/[^0-9]/g, '')}` : '',
      photoUrl: imagePreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEmployees([...employees, newEmployee]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast({
      title: 'Success',
      description: 'Employee created successfully'
    });
  };

  const handleUpdateEmployee = () => {
    if (!selectedEmployee) return;

    if (!formData.name || !formData.email || !formData.employeeId || !formData.department || !formData.panCard || !formData.aadharCard || !formData.shift) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: 'Error',
        description: emailError,
        variant: 'destructive'
      });
      return;
    }

    if (!validatePhoneNumber(formData.phone?.replace(/[^0-9]/g, '') || '', formData.countryCode || '+91')) {
      toast({
        title: 'Error',
        description: phoneError,
        variant: 'destructive'
      });
      return;
    }

    if (!validatePanCard(formData.panCard)) {
      toast({
        title: 'Error',
        description: panCardError,
        variant: 'destructive'
      });
      return;
    }

    if (!validateAadharCard(formData.aadharCard)) {
      toast({
        title: 'Error',
        description: aadharCardError,
        variant: 'destructive'
      });
      return;
    }

    const updatedEmployees = employees.map(emp => 
      emp.id === selectedEmployee.id 
        ? {
            ...emp,
            ...formData,
            phone: formData.phone ? `${formData.countryCode || '+91'}-${formData.phone.replace(/[^0-9]/g, '')}` : '',
            photoUrl: imagePreview || emp.photoUrl,
            updatedAt: new Date().toISOString()
          }
        : emp
    );

    setEmployees(updatedEmployees);
    setIsEditDialogOpen(false);
    resetForm();
    toast({
      title: 'Success',
      description: 'Employee updated successfully'
    });
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    toast({
      title: 'Success',
      description: 'Employee deleted successfully'
    });
  };

  const handleToggleStatus = (id: string) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, status: emp.status === 'active' ? 'inactive' : 'active', updatedAt: new Date().toISOString() } : emp
      )
    );
    toast({ title: 'Status updated', description: 'Employee status changed successfully' });
  };

  const openViewDialog = (employee: Employee) => {
    setViewEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleBulkUpload = () => {
    try {
      const lines = bulkData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const newEmployees: Employee[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) {
          const email = values[2] || '';
          if (!validateEmail(email)) {
            toast({
              title: 'Error',
              description: `Invalid email in row ${i + 1}: ${email}`,
              variant: 'destructive'
            });
            return;
          }
          const countryCode = values[6] ? values[6].split('-')[0] : '+91';
          let phoneNumber = values[6] ? values[6].split('-')[1] || '' : '';
          phoneNumber = handlePhoneInput(phoneNumber, countryCode);
          if (!validatePhoneNumber(phoneNumber.replace(/[^0-9]/g, ''), countryCode)) {
            toast({
              title: 'Error',
              description: `Invalid phone number in row ${i + 1}: ${phoneNumber}`,
              variant: 'destructive'
            });
            return;
          }
          const panCard = values[13] || '';
          if (!validatePanCard(panCard)) {
            toast({
              title: 'Error',
              description: `Invalid PAN Card in row ${i + 1}: ${panCard}`,
              variant: 'destructive'
            });
            return;
          }
          const aadharCard = values[14] || '';
          if (!validateAadharCard(aadharCard)) {
            toast({
              title: 'Error',
              description: `Invalid Aadhar Card in row ${i + 1}: ${aadharCard}`,
              variant: 'destructive'
            });
            return;
          }
          const shift = values[15] || '';
          if (!['day', 'night', 'rotating'].includes(shift)) {
            toast({
              title: 'Error',
              description: `Invalid shift type in row ${i + 1}: ${shift}`,
              variant: 'destructive'
            });
            return;
          }
          newEmployees.push({
            id: Date.now().toString() + i,
            employeeId: values[0] || `EMP${Date.now()}${i}`,
            name: values[1] || '',
            email: email,
            department: values[3] || '',
            role: (values[4] as any) || 'employee',
            designation: values[5] || '',
            phone: phoneNumber ? `${countryCode}-${phoneNumber.replace(/[^0-9]/g, '')}` : '',
            countryCode: countryCode,
            address: values[7] || '',
            joiningDate: values[8] || new Date().toISOString().split('T')[0],
            status: (values[9] as any) || 'active',
            gender: (values[10] as any) || undefined,
            employeeType: (values[11] as any) || undefined,
            resignationDate: values[12] || undefined,
            panCard: panCard,
            aadharCard: aadharCard,
            shift: shift as 'day' | 'night' | 'rotating',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values[1]}`
          });
        }
      }

      setEmployees([...employees, ...newEmployees]);
      setIsBulkUploadOpen(false);
      setBulkData('');
      toast({
        title: 'Success',
        description: `${newEmployees.length} employees imported successfully`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to parse CSV data. Please check the format.',
        variant: 'destructive'
      });
    }
  };

  const exportEmployees = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Role', 'Designation', 'Phone', 'Address', 'Joining Date', 'Status', 'Gender', 'Employee Type', 'Resignation Date', 'PAN Card', 'Aadhar Card', 'Shift'];
    const data = employees.map(emp => [
      emp.employeeId,
      emp.name,
      emp.email,
      emp.department,
      emp.role,
      emp.designation,
      emp.phone || '',
      emp.address || '',
      emp.joiningDate,
      emp.status,
      emp.gender || '',
      emp.employeeType || '',
      emp.resignationDate || '',
      emp.panCard || '',
      emp.aadharCard || '',
      emp.shift || ''
    ]);

    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      employeeId: '',
      department: '',
      role: 'employee',
      designation: '',
      phone: '',
      address: '',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'active',
      resignationDate: undefined,
      gender: undefined,
      employeeType: undefined,
      countryCode: '+91',
      panCard: '',
      aadharCard: '',
      shift: undefined
    });
    setImageFile(null);
    setImagePreview('');
    setSelectedEmployee(null);
    setPhoneError('');
    setEmailError('');
    setPanCardError('');
    setAadharCardError('');
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    const [countryCode = '+91', phone = ''] = employee.phone ? employee.phone.split('-') : ['+91', ''];
    setFormData({ ...employee, countryCode, phone: formatPhoneNumber(phone, countryCode) });
    setImagePreview(employee.photoUrl || '');
    setIsEditDialogOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateEmployee();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUpdateEmployee();
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6" />
              Employee Management
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button onClick={exportEmployees} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] max-w-lg sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Bulk Upload Employees</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>CSV Format</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        EmployeeID, Name, Email, Department, Role, Designation, Phone, Address, JoiningDate, Status, Gender, EmployeeType, ResignationDate, PANCard, AadharCard, Shift
                      </p>
                    </div>
                    <Textarea
                      placeholder="Paste CSV data here..."
                      value={bulkData}
                      onChange={(e) => setBulkData(e.target.value)}
                      rows={10}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkUpload}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-[450px] max-h-[80vh] overflow-y-auto p-4">
                  <DialogHeader>
                    <DialogTitle>Create New Employee</DialogTitle>
                    <DialogDescription>Fill in the required fields marked with *</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4" onKeyDown={handleKeyDown}>
                    <div className="flex justify-center">
                      <div 
                        className="relative w-24 h-24 cursor-pointer" 
                        onClick={() => createFileInputRef.current?.click()}
                      >
                        {imagePreview ? (
                          <>
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover rounded-full border" 
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageFile(null);
                                setImagePreview('');
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full border hover:bg-gray-200 transition">
                            <Upload className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <Input
                          id="create-photo"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          ref={createFileInputRef}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="create-employeeId">Employee ID *</Label>
                      <Input
                        id="create-employeeId"
                        value={formData.employeeId || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, employeeId: e.target.value }))}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="create-name">Name *</Label>
                      <Input
                        id="create-name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="create-email">Email *</Label>
                      <Input
                        id="create-email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => {
                          const email = e.target.value;
                          setFormData((prev) => ({ ...prev, email }));
                          validateEmail(email);
                        }}
                        required
                        className={`mt-1 ${emailError ? 'border-red-500' : ''}`}
                      />
                      {emailError && (
                        <p className="text-red-500 text-sm mt-1">{emailError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="create-department">Department *</Label>
                      <Select
                        value={formData.department || ''}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="create-role">Role *</Label>
                      <Select
                        value={formData.role || 'employee'}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value as any }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="team_lead">Team Lead</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="create-designation">Designation</Label>
                      <Input
                        id="create-designation"
                        value={formData.designation || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, designation: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="create-joiningDate">Joining Date</Label>
                      <Input
                        id="create-joiningDate"
                        type="date"
                        value={formData.joiningDate || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, joiningDate: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="create-countryCode">Country Code</Label>
                      <Select
                        value={formData.countryCode || '+91'}
                        onValueChange={(value) => {
                          setFormData((prev) => ({ ...prev, countryCode: value }));
                          validatePhoneNumber(formData.phone?.replace(/[^0-9]/g, '') || '', value);
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Country Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map(({ code, flag, name }) => (
                            <SelectItem key={code} value={code}>
                              {flag} {code} ({name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="create-phone">Phone</Label>
                      <Input
                        id="create-phone"
                        value={formData.phone || ''}
                        onChange={(e) => {
                          const phone = handlePhoneInput(e.target.value, formData.countryCode || '+91');
                          setFormData((prev) => ({ ...prev, phone }));
                          validatePhoneNumber(phone.replace(/[^0-9]/g, ''), formData.countryCode || '+91');
                        }}
                        className={`mt-1 ${phoneError ? 'border-red-500' : ''}`}
                        placeholder={formData.countryCode === '+91' ? 'e.g., 987-654-3210' : 'e.g., 123-456-7890'}
                      />
                      {phoneError && (
                        <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="create-address">Address</Label>
                      <Input
                        id="create-address"
                        value={formData.address || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="create-panCard">PAN Card *</Label>
                      <Input
                        id="create-panCard"
                        value={formData.panCard || ''}
                        onChange={(e) => {
                          const panCard = e.target.value.toUpperCase();
                          setFormData((prev) => ({ ...prev, panCard }));
                          validatePanCard(panCard);
                        }}
                        required
                        className={`mt-1 ${panCardError ? 'border-red-500' : ''}`}
                        placeholder="e.g., ABCDE1234F"
                      />
                      {panCardError && (
                        <p className="text-red-500 text-sm mt-1">{panCardError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="create-aadharCard">Aadhar Card *</Label>
                      <Input
                        id="create-aadharCard"
                        value={formData.aadharCard || ''}
                        onChange={(e) => {
                          const aadharCard = e.target.value;
                          setFormData((prev) => ({ ...prev, aadharCard }));
                          validateAadharCard(aadharCard);
                        }}
                        required
                        className={`mt-1 ${aadharCardError ? 'border-red-500' : ''}`}
                        placeholder="e.g., 1234-5678-9012"
                      />
                      {aadharCardError && (
                        <p className="text-red-500 text-sm mt-1">{aadharCardError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="create-shift">Shift *</Label>
                      <Select
                        value={formData.shift || ''}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, shift: value as 'day' | 'night' | 'rotating' }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                          <SelectItem value="rotating">Rotating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <RadioGroup
                        value={formData.gender || ''}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value as 'male' | 'female' | 'other' }))}
                        className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="create-male" />
                          <Label htmlFor="create-male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="create-female" />
                          <Label htmlFor="create-female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="create-other" />
                          <Label htmlFor="create-other">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label htmlFor="create-employeeType">Employee Type</Label>
                      <Select
                        value={formData.employeeType || ''}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, employeeType: value as 'contract' | 'permanent' }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Employee Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contract">Contract-based</SelectItem>
                          <SelectItem value="permanent">Permanent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="create-resignationDate">Date of Resignation</Label>
                      <Input
                        id="create-resignationDate"
                        type="date"
                        value={formData.resignationDate || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, resignationDate: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-4 sticky bottom-0 bg-white py-2 flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateEmployee} className="w-full sm:w-auto">
                      Create Employee
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  aria-label="Search employees"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="team_lead">Team Lead</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] hidden sm:table-cell">Photo</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Avatar>
                        <AvatarImage src={employee.photoUrl} alt={employee.name} />
                        <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{employee.employeeId}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{employee.email}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={employee.role === 'admin' ? 'destructive' : 'default'}>
                        {employee.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openViewDialog(employee)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleToggleStatus(employee.id)}
                        >
                          {employee.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[450px] max-h-[80vh] overflow-y-auto p-4">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update the employee details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4" onKeyDown={handleEditKeyDown}>
            <div className="flex justify-center">
              <div 
                className="relative w-24 h-24 cursor-pointer" 
                onClick={() => editFileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-full border" 
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full border hover:bg-gray-200 transition">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <Input
                  id="edit-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  ref={editFileInputRef}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-employeeId">Employee ID *</Label>
              <Input
                id="edit-employeeId"
                value={formData.employeeId || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, employeeId: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => {
                  const email = e.target.value;
                  setFormData((prev) => ({ ...prev, email }));
                  validateEmail(email);
                }}
                required
                className={`mt-1 ${emailError ? 'border-red-500' : ''}`}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-department">Department *</Label>
              <Select
                value={formData.department || ''}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-role">Role *</Label>
              <Select
                value={formData.role || 'employee'}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value as any }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="team_lead">Team Lead</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-designation">Designation</Label>
              <Input
                id="edit-designation"
                value={formData.designation || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, designation: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-joiningDate">Joining Date</Label>
              <Input
                id="edit-joiningDate"
                type="date"
                value={formData.joiningDate || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, joiningDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-countryCode">Country Code</Label>
              <Select
                value={formData.countryCode || '+91'}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, countryCode: value }));
                  validatePhoneNumber(formData.phone?.replace(/[^0-9]/g, '') || '', value);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Country Code" />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map(({ code, flag, name }) => (
                    <SelectItem key={code} value={code}>
                      {flag} {code} ({name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone || ''}
                onChange={(e) => {
                  const phone = handlePhoneInput(e.target.value, formData.countryCode || '+91');
                  setFormData((prev) => ({ ...prev, phone }));
                  validatePhoneNumber(phone.replace(/[^0-9]/g, ''), formData.countryCode || '+91');
                }}
                className={`mt-1 ${phoneError ? 'border-red-500' : ''}`}
                placeholder={formData.countryCode === '+91' ? 'e.g., 987-654-3210' : 'e.g., 123-456-7890'}
              />
              {phoneError && (
                <p className="text-red-500 text-sm mt-1">{phoneError}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-panCard">PAN Card *</Label>
              <Input
                id="edit-panCard"
                value={formData.panCard || ''}
                onChange={(e) => {
                  const panCard = e.target.value.toUpperCase();
                  setFormData((prev) => ({ ...prev, panCard }));
                  validatePanCard(panCard);
                }}
                required
                className={`mt-1 ${panCardError ? 'border-red-500' : ''}`}
                placeholder="e.g., ABCDE1234F"
              />
              {panCardError && (
                <p className="text-red-500 text-sm mt-1">{panCardError}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-aadharCard">Aadhar Card *</Label>
              <Input
                id="edit-aadharCard"
                value={formData.aadharCard || ''}
                onChange={(e) => {
                  const aadharCard = e.target.value;
                  setFormData((prev) => ({ ...prev, aadharCard }));
                  validateAadharCard(aadharCard);
                }}
                required
                className={`mt-1 ${aadharCardError ? 'border-red-500' : ''}`}
                placeholder="e.g., 1234-5678-9012"
              />
              {aadharCardError && (
                <p className="text-red-500 text-sm mt-1">{aadharCardError}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-shift">Shift *</Label>
              <Select
                value={formData.shift || ''}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, shift: value as 'day' | 'night' | 'rotating' }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="rotating">Rotating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Gender</Label>
              <RadioGroup
                value={formData.gender || ''}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value as 'male' | 'female' | 'other' }))}
                className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="edit-male" />
                  <Label htmlFor="edit-male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="edit-female" />
                  <Label htmlFor="edit-female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="edit-other" />
                  <Label htmlFor="edit-other">Other</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="edit-employeeType">Employee Type</Label>
              <Select
                value={formData.employeeType || ''}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, employeeType: value as 'contract' | 'permanent' }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Employee Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract-based</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-resignationDate">Date of Resignation</Label>
              <Input
                id="edit-resignationDate"
                type="date"
                value={formData.resignationDate || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, resignationDate: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="mt-4 sticky bottom-0 bg-white py-2 flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployee} className="w-full sm:w-auto">
              Update Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[350px] p-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Employee Profile</DialogTitle>
            <DialogDescription className="text-sm">Quick profile preview</DialogDescription>
          </DialogHeader>
          {viewEmployee && (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border">
                <img 
                  src={viewEmployee.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewEmployee.name}`} 
                  alt={viewEmployee.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h3 className="text-base font-semibold">{viewEmployee.name}</h3>
              <p className="text-xs text-muted-foreground">{viewEmployee.designation || '-'}</p>
              <Badge variant={viewEmployee.status === 'active' ? 'default' : 'secondary'}>
                {viewEmployee.status}
              </Badge>
              <div className="w-full space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee ID</span>
                  <span className="font-medium">{viewEmployee.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{viewEmployee.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium">{viewEmployee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium">{viewEmployee.role.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{viewEmployee.phone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium">{viewEmployee.gender ? viewEmployee.gender.charAt(0).toUpperCase() + viewEmployee.gender.slice(1) : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee Type</span>
                  <span className="font-medium">{viewEmployee.employeeType ? viewEmployee.employeeType.charAt(0).toUpperCase() + viewEmployee.employeeType.slice(1) : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resignation Date</span>
                  <span className="font-medium">{viewEmployee.resignationDate || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PAN Card</span>
                  <span className="font-medium">{viewEmployee.panCard || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aadhar Card</span>
                  <span className="font-medium">{viewEmployee.aadharCard || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shift</span>
                  <span className="font-medium">{viewEmployee.shift ? viewEmployee.shift.charAt(0).toUpperCase() + viewEmployee.shift.slice(1) : '-'}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}