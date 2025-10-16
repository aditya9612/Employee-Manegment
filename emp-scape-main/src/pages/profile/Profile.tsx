import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Clock,
  Award,
  Target,
  TrendingUp,
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!user || !editedUser) return null;

  const handleSave = () => {
    if (editedUser) {
      updateUser(editedUser);
      if (selectedImage) {
        updateUser({ ...editedUser, profilePhoto: selectedImage });
      }
      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setSelectedImage(null);
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      hr: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      manager: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      team_lead: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      employee: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return colors[role as keyof typeof colors] || colors.employee;
  };

  const stats = [
    { label: 'Total Tasks', value: '48', icon: Target, color: 'text-blue-500' },
    { label: 'Completed', value: '36', icon: Award, color: 'text-green-500' },
    { label: 'In Progress', value: '12', icon: TrendingUp, color: 'text-orange-500' },
    { label: 'Attendance', value: '95%', icon: Clock, color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Card */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="relative h-32 bg-gradient-to-r from-primary via-primary/80 to-primary/60">
            <div className="absolute inset-0 bg-grid-white/10" />
          </div>
          <CardContent className="relative -mt-16 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl">
                  <AvatarImage src={selectedImage || user.profilePhoto} alt={user.name} />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                    <Camera className="h-5 w-5 text-primary-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <Badge className={`${getRoleBadgeColor(user.role)} px-3 py-1`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {t.roles[user.role]}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{user.designation}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {user.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(user.joiningDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="shadow-lg">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} className="shadow-lg">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-background ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 bg-card">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Manage your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                    disabled={!isEditing}
                    className="disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    disabled={!isEditing}
                    className="disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editedUser.phone || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="+91 98765 43210"
                    className="disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={editedUser.address || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter your address"
                    className="disabled:opacity-60"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Professional Information
                </CardTitle>
                <CardDescription>
                  Your role and department details
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={user.id}
                    disabled
                    className="disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={editedUser.department}
                    onChange={(e) => setEditedUser({ ...editedUser, department: e.target.value })}
                    disabled={!isEditing}
                    className="disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={editedUser.designation}
                    onChange={(e) => setEditedUser({ ...editedUser, designation: e.target.value })}
                    disabled={!isEditing}
                    className="disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    value={editedUser.joiningDate}
                    disabled
                    className="disabled:opacity-60"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea
                  placeholder="Tell us about yourself, your skills, and experience..."
                  className="min-h-[120px] disabled:opacity-60"
                  disabled={!isEditing}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account preferences and security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your password regularly</p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;