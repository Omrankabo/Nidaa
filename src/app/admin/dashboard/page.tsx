
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { EmergencyRequest, Volunteer } from '@/lib/types';
import { AlertCircle, UserPlus, CheckCircle, Clock, Trash2, Info, UserCheck, PlayCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getRequests, getVolunteers, updateRequest, deleteRequest } from '@/lib/firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// A client component to format a timestamp into a locale-specific date-time string.
// It uses useEffect to prevent server-client hydration mismatches.
const FormattedDate = ({ timestamp }: { timestamp: any }) => {
    const [isMounted, setIsMounted] = useState(false);
  
    useEffect(() => {
      setIsMounted(true);
    }, []);
  
    if (!isMounted) {
      return null;
    }

    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        numberingSystem: 'latn' // Use English numerals
    };
  
    return <>{date.toLocaleString('ar-EG', options)}</>;
};

export default function DashboardPage() {
  // State for storing requests, volunteers, loading status, and filters.
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  // Effect to subscribe to real-time updates for requests and volunteers from Firestore.
  useEffect(() => {
    // onValue returns an unsubscribe function that we call on component unmount.
    const unsubscribeRequests = getRequests((data) => {
        setRequests(data);
        setLoading(false);
    });
    const unsubscribeVolunteers = getVolunteers((data) => {
        setVolunteers(data);
    });

    return () => {
        unsubscribeRequests();
        unsubscribeVolunteers();
    };
  }, []);
  
  /**
   * Assigns a volunteer to a specific request and updates its status.
   * @param {string} requestId - The ID of the request to update.
   * @param {Volunteer} volunteer - The volunteer object to assign.
   */
  const handleAssign = async (requestId: string, volunteer: Volunteer) => {
    const eta = `${Math.floor(Math.random() * 10) + 5}-${Math.floor(Math.random() * 5) + 15} دقيقة`;
    await updateRequest(requestId, {
        status: 'تم التعيين',
        assignedVolunteer: volunteer.fullName,
        volunteerId: volunteer.id,
        eta: eta,
    });
    setDialogOpen(false); // Close the dialog after assigning
  };

  /**
   * Updates the priority level of a request.
   * @param {string} requestId - The ID of the request.
   * @param {EmergencyRequest['priorityLevel']} priorityLevel - The new priority level.
   */
  const handlePriorityChange = async (requestId: string, priorityLevel: EmergencyRequest['priorityLevel']) => {
    await updateRequest(requestId, { priorityLevel });
  };
  
  /**
   * Updates the status of a request.
   * @param {string} requestId - The ID of the request.
   * @param {EmergencyRequest['status']} status - The new status.
   */
  const handleStatusChange = async (requestId: string, status: EmergencyRequest['status']) => {
      await updateRequest(requestId, { status });
  };
  
  /**
   * Deletes a request from the database.
   * @param {string} requestId - The ID of the request to delete.
   */
  const handleDeleteRequest = async (requestId: string) => {
      await deleteRequest(requestId);
  };

  // Helper functions to get badge variants and text based on priority and status.
  const getPriorityBadgeVariant = (priority: EmergencyRequest['priorityLevel']) => {
    switch (priority) {
      case 'حرجة': return 'destructive';
      case 'عالية': return 'default';
      case 'متوسطة': return 'secondary';
      case 'عادية': return 'outline';
      default: return 'outline';
    }
  };
  
  const getPriorityText = (priority: EmergencyRequest['priorityLevel']) => {
      switch (priority) {
          case 'حرجة': return 'حرجة';
          case 'عالية': return 'عالية';
          case 'متوسطة': return 'متوسطة';
          case 'عادية': return 'عادية';
      }
  }

  const getStatusBadge = (status: EmergencyRequest['status']) => {
    switch (status) {
      case 'تم التعيين': return <Badge className="bg-blue-500"><CheckCircle className="ml-1 h-3 w-3" />تم التعيين</Badge>;
      case 'في الانتظار': return <Badge variant="secondary"><Clock className="ml-1 h-3 w-3" />في الانتظار</Badge>;
      case 'قيد التنفيذ': return <Badge className="bg-yellow-500"><PlayCircle className="ml-1 h-3 w-3" />قيد التنفيذ</Badge>;
      case 'اتحلت': return <Badge className="bg-green-500"><CheckCircle className="ml-1 h-3 w-3" />تم الحل</Badge>;
      case 'ملغية': return <Badge variant="destructive"><AlertCircle className="ml-1 h-3 w-3" />ملغية</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const openAssignDialog = (requestId: string) => {
    setCurrentRequestId(requestId);
    setDialogOpen(true);
  };

  // Filtering and data derivation for the dashboard UI.
  const regions = [...new Set(requests.map(r => r.location.split(',')[0].trim()))];
  const filteredRequests = regionFilter === 'all' ? requests : requests.filter(r => r.location.startsWith(regionFilter));
  
  const requestByRegionCount = requests.reduce((acc, req) => {
    const region = req.location.split(',')[0].trim();
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const verifiedVolunteers = volunteers.filter(v => v.status === 'تم التحقق');
  const khartoumVolunteers = verifiedVolunteers.filter(v => v.region === 'الخرطوم');

  if (loading) {
    return <div className="flex justify-center items-center h-full"><AlertCircle className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-8">
      {/* Card for displaying analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">تحليلات الطلبات</CardTitle>
          <CardDescription>نظرة سريعة على الطلبات حسب المنطقة.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(requestByRegionCount).map(([region, count]) => (
            <Card key={region}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{region}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">إجمالي الطلبات</p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
      
      {/* Card for viewing and managing all emergency requests */}
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle className="font-headline">جميع طلبات الطوارئ</CardTitle>
                    <CardDescription>هذه هي جميع الطلبات الواردة، مرتبة حسب الوقت.</CardDescription>
                </div>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="فلتر حسب المنطقة" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل المناطق</SelectItem>
                        {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
        {filteredRequests.length > 0 ? (
            <div className="w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[300px]">تفاصيل الطلب</TableHead>
                        <TableHead className="w-[150px] text-center">الأهمية</TableHead>
                        <TableHead className="w-[170px] text-center hidden sm:table-cell">الحالة</TableHead>
                         <TableHead className="w-[180px] text-center hidden md:table-cell">المتطوع المسؤول</TableHead>
                        <TableHead className="w-[250px] text-center">الإجراء</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredRequests.map((req) => (
                        <TableRow key={req.id}>
                        <TableCell>
                            <p className="font-medium truncate max-w-xs">{req.requestText}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                <FormattedDate timestamp={req.timestamp} />
                            </p>
                        </TableCell>
                        <TableCell className="text-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                     <Button variant={getPriorityBadgeVariant(req.priorityLevel)} className="w-24">
                                        {getPriorityText(req.priorityLevel)}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handlePriorityChange(req.id, 'حرجة')}>حرجة</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePriorityChange(req.id, 'عالية')}>عالية</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePriorityChange(req.id, 'متوسطة')}>متوسطة</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePriorityChange(req.id, 'عادية')}>عادية</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="inline-flex">
                                         {getStatusBadge(req.status)}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'في الانتظار')}>في الانتظار</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'تم التعيين')}>تم التعيين</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'قيد التنفيذ')}>قيد التنفيذ</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'اتحلت')}>تم الحل</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'ملغية')}>ملغية</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                         <TableCell className="text-center hidden md:table-cell">{req.assignedVolunteer || 'لم يتم التعيين بعد'}</TableCell>
                        <TableCell className="text-center">
                            <div className="flex justify-center items-center gap-1">
                                {/* Dialog for assigning a volunteer */}
                                {req.status === 'في الانتظار' && (
                                    <Button size="sm" onClick={() => openAssignDialog(req.id)}><UserPlus className="ml-2 h-4 w-4" />تعيين</Button>
                                )}
                                {/* Dialog for re-assigning a volunteer */}
                                {req.status === 'تم التعيين' && (
                                     <Button size="sm" variant="outline" onClick={() => openAssignDialog(req.id)}><UserCheck className="ml-2 h-4 w-4" />إعادة تعيين</Button>
                                )}
                                {/* Dialog for viewing full request details */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon"><Info className="h-4 w-4" /></Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>تفاصيل الطلب كاملة</DialogTitle>
                                            <DialogDescription>
                                                رقم الطلب: {req.id}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                                            <div>
                                                <h4 className="font-semibold">نص الطلب:</h4>
                                                <p className="p-2 bg-muted rounded-md whitespace-pre-wrap break-words">{req.requestText}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">الموقع:</h4>
                                                <p>{req.location}</p>
                                            </div>
                                             <div>
                                                <h4 className="font-semibold">هاتف التواصل:</h4>
                                                <p>{req.contactPhone}</p>
                                            </div>
                                            {req.report && (
                                                <div>
                                                    <h4 className="font-semibold">ملاحظات المتطوع:</h4>
                                                    <p className="p-2 bg-muted rounded-md whitespace-pre-wrap break-words">{req.report}</p>
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                {/* Alert Dialog for deleting a request */}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                         <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                            <AlertDialogDescription>
                                            هذا الإجراء سيحذف الطلب نهائيًا. لا يمكن التراجع عن هذا الإجراء.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteRequest(req.id)}>حذف</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <span className="sm:hidden ml-2">{getStatusBadge(req.status)}</span>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
        ) : (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>لا توجد طلبات</AlertTitle>
                <AlertDescription>
                    لا توجد طلبات تطابق الفلتر الذي اخترته.
                </AlertDescription>
            </Alert>
        )}
        </CardContent>
    </Card>

    {/* Assign Volunteer Dialog - rendered outside the table map */}
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>اختر متطوعًا</DialogTitle>
                <DialogDescription>اختر متطوعًا متاحًا من منطقة الخرطوم.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {khartoumVolunteers.length > 0 ? khartoumVolunteers.map(v => (
                    <div key={v.id} className="flex justify-between items-center p-2 border rounded-md">
                        <div>
                            <p className="font-semibold">{v.fullName}</p>
                            <p className="text-sm text-muted-foreground">{v.profession}</p>
                        </div>
                        <Button size="sm" onClick={() => currentRequestId && handleAssign(currentRequestId, v)}>تعيين</Button>
                    </div>
                )) : <p>لا يوجد متطوعون متاحون في الخرطوم حاليًا.</p>}
            </div>
        </DialogContent>
    </Dialog>

    </div>
  );
}
