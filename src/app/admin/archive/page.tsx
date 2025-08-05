
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { EmergencyRequest } from '@/lib/types';
import { AlertCircle, Archive, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getRequests } from '@/lib/firebase/firestore';

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

export default function ArchivePage() {
  const [archivedRequests, setArchivedRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeRequests = getRequests((allRequests) => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const filtered = allRequests.filter(req => {
            const requestDate = new Date(req.timestamp);
            return req.status === 'اتحلت' && requestDate < oneMonthAgo;
        });

        setArchivedRequests(filtered);
        setLoading(false);
    });

    return () => unsubscribeRequests();
  }, []);


  if (loading) {
    return <div className="flex justify-center items-center h-full"><AlertCircle className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Archive className="h-6 w-6" />
            <CardTitle className="font-headline">الطلبات المؤرشفة</CardTitle>
        </div>
        <CardDescription>هذه هي الطلبات التي تم حلها وأرشفتها بعد مرور 30 يومًا.</CardDescription>
      </CardHeader>
      <CardContent>
      {archivedRequests.length > 0 ? (
          <div className="w-full overflow-x-auto">
              <Table className="min-w-full">
                  <TableHeader>
                  <TableRow>
                      <TableHead>تفاصيل الطلب</TableHead>
                      <TableHead className="hidden sm:table-cell">الحالة</TableHead>
                      <TableHead className="hidden md:table-cell">المتطوع المسؤول</TableHead>
                      <TableHead className="text-center">تاريخ الحل</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {archivedRequests.map((req) => (
                      <TableRow key={req.id}>
                      <TableCell>
                          <p className="font-medium truncate max-w-md">{req.requestText}</p>
                           <p className="text-xs text-muted-foreground mt-2">
                                رقم الطلب: {req.id}
                            </p>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className="bg-green-500"><CheckCircle className="ml-1 h-3 w-3" />تم الحل</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{req.assignedVolunteer || 'غير محدد'}</TableCell>
                      <TableCell className="text-center">
                        <FormattedDate timestamp={req.timestamp} />
                      </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
          </div>
      ) : (
          <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>لا توجد طلبات مؤرشفة</AlertTitle>
              <AlertDescription>
                  لا توجد حاليًا أي طلبات قديمة محفوظة في الأرشيف.
              </AlertDescription>
          </Alert>
      )}
      </CardContent>
  </Card>
  );
}
