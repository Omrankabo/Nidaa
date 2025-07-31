'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Volunteer } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckCircle, MoreHorizontal, XCircle, Clock } from 'lucide-react';

const initialVolunteers: Volunteer[] = [
  { id: '1', fullName: 'Fatima Al-Amin', gender: 'Female', region: 'Khartoum', city: 'Khartoum', profession: 'Doctor', phoneNumber: '+249 912 345 678', status: 'Verified' },
  { id: '2', fullName: 'Ahmed Ibrahim', gender: 'Male', region: 'Gezira', city: 'Wad Madani', profession: 'Nurse', phoneNumber: '+249 923 456 789', status: 'Verified' },
  { id: '3', fullName: 'Musa Adam', gender: 'Male', region: 'North Kordofan', city: 'El-Obeid', profession: 'Driver', phoneNumber: '+249 123 456 789', status: 'Pending' },
  { id: '4', fullName: 'Layla Hassan', gender: 'Female', region: 'Red Sea', city: 'Port Sudan', profession: 'Paramedic', phoneNumber: '+249 999 888 777', status: 'Pending' },
  { id: '5', fullName: 'Yusuf Khalid', gender: 'Male', region: 'Khartoum', city: 'Omdurman', profession: 'Pharmacist', phoneNumber: '+249 111 222 333', status: 'Rejected' },
];

export default function VolunteersPage() {
    const [volunteers, setVolunteers] = useState<Volunteer[]>(initialVolunteers);

    const handleStatusChange = (id: string, status: Volunteer['status']) => {
        setVolunteers(volunteers.map(v => v.id === id ? { ...v, status } : v));
    };

  const getStatusBadge = (status: Volunteer['status']) => {
    switch (status) {
      case 'Verified':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3" />Verified</Badge>;
      case 'Pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'Rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Registered Volunteers</CardTitle>
        <CardDescription>View, verify, and manage all registered responders in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Profession</TableHead>
                <TableHead className="hidden sm:table-cell">Phone Number</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volunteers.map((volunteer) => (
                <TableRow key={volunteer.id}>
                  <TableCell className="font-medium">{volunteer.fullName}</TableCell>
                  <TableCell className="hidden md:table-cell">{volunteer.city}, {volunteer.region}</TableCell>
                  <TableCell className="hidden lg:table-cell">{volunteer.profession}</TableCell>
                  <TableCell className="hidden sm:table-cell">{volunteer.phoneNumber}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(volunteer.status)}</TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon">
                             <MoreHorizontal className="h-4 w-4" />
                           </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(volunteer.id, 'Verified')}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span>Approve</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(volunteer.id, 'Rejected')}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                <span>Reject</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
