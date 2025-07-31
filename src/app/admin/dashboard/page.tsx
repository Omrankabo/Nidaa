'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { EmergencyRequest } from '@/lib/types';
import { AlertCircle, UserPlus, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialRequests: EmergencyRequest[] = [
    {
        id: '1',
        requestText: "A building collapsed in Al-Amarat, many people are trapped under the rubble. We need ambulances and rescue teams urgently.",
        priorityLevel: 'critical',
        reason: "The request mentions a collapsed building with multiple people trapped, indicating a mass casualty incident requiring immediate and extensive emergency response.",
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        status: 'Assigned',
        assignedVolunteer: 'Fatima Al-Amin',
    },
    {
        id: '2',
        requestText: "There's a car accident on the main road to Bahri. One person is bleeding heavily from the head and seems unconscious.",
        priorityLevel: 'high',
        reason: "The report of a car accident with a person who is unconscious and bleeding heavily indicates a life-threatening injury that requires immediate medical attention.",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'Pending',
    },
    {
        id: '3',
        requestText: "Reports of a fire at a market stall in Khartoum North. It seems small but needs checking.",
        priorityLevel: 'medium',
        reason: "A small fire can escalate quickly. It's important to dispatch a team to assess and control the situation.",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: 'Pending',
    }
];

export default function DashboardPage() {
  const [requests, setRequests] = useState<EmergencyRequest[]>(initialRequests);

  const handleAutoMatch = (requestId: string) => {
    // In a real app, this would trigger a backend process to find and assign a suitable volunteer.
    // For this prototype, we'll just simulate it by assigning a mock volunteer.
    setRequests(requests.map(r => r.id === requestId ? {...r, status: 'Assigned', assignedVolunteer: 'Ahmed Ibrahim'} : r));
  };


  const getPriorityBadgeVariant = (priority: EmergencyRequest['priorityLevel']) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusBadge = (status: EmergencyRequest['status']) => {
    switch (status) {
      case 'Assigned':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><CheckCircle className="mr-1 h-3 w-3" />Assigned</Badge>;
      case 'Pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
        <CardHeader>
        <CardTitle className="font-headline">Prioritized Requests Queue</CardTitle>
        <CardDescription>
            List of incoming emergency requests, sorted by priority and time.
        </CardDescription>
        </CardHeader>
        <CardContent>
        {requests.length > 0 ? (
            <div className="max-h-[70vh] overflow-y-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Request Details</TableHead>
                        <TableHead className="w-[120px] text-center">Priority</TableHead>
                        <TableHead className="w-[120px] text-center">Status</TableHead>
                        <TableHead className="w-[200px]">Assigned To</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {requests.map((req) => (
                        <TableRow key={req.id}>
                        <TableCell>
                            <p className="font-medium">{req.requestText}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-semibold">Reason:</span> {req.reason}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                            {new Date(req.timestamp).toLocaleString()}
                            </p>
                        </TableCell>
                        <TableCell className="text-center">
                            <Badge variant={getPriorityBadgeVariant(req.priorityLevel)}>
                            {req.priorityLevel}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(req.status)}</TableCell>
                        <TableCell>
                            {req.status === 'Pending' ? (
                                <Button size="sm" onClick={() => handleAutoMatch(req.id)}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Auto-match
                                </Button>
                            ) : (
                                <span className="font-medium">{req.assignedVolunteer}</span>
                            )}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
        ) : (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Active Requests</AlertTitle>
                <AlertDescription>
                    The emergency request queue is currently empty. New prioritized requests will appear here.
                </AlertDescription>
            </Alert>
        )}
        </CardContent>
    </Card>
  );
}
