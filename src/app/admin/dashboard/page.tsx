'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { prioritizeRequestAction } from '@/lib/actions';
import type { EmergencyRequest } from '@/lib/types';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const requestSchema = z.object({
  requestText: z.string().min(10, { message: 'Request must be at least 10 characters.' }),
});

const initialRequests: EmergencyRequest[] = [
    {
        id: '1',
        requestText: "A building collapsed in Al-Amarat, many people are trapped under the rubble. We need ambulances and rescue teams urgently.",
        priorityLevel: 'critical',
        reason: "The request mentions a collapsed building with multiple people trapped, indicating a mass casualty incident requiring immediate and extensive emergency response.",
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
        id: '2',
        requestText: "There's a car accident on the main road to Bahri. One person is bleeding heavily from the head and seems unconscious.",
        priorityLevel: 'high',
        reason: "The report of a car accident with a person who is unconscious and bleeding heavily indicates a life-threatening injury that requires immediate medical attention.",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    }
];

export default function DashboardPage() {
  const [requests, setRequests] = useState<EmergencyRequest[]>(initialRequests);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { requestText: '' },
  });

  const onSubmit = async (values: z.infer<typeof requestSchema>) => {
    setIsSubmitting(true);
    const result = await prioritizeRequestAction(values.requestText);
    if (result.success && result.data) {
      const newRequest: EmergencyRequest = {
        id: new Date().getTime().toString(),
        requestText: values.requestText,
        ...result.data,
        timestamp: new Date().toISOString(),
      };
      setRequests((prev) => [newRequest, ...prev]);
      form.reset();
      toast({
        title: 'Request Prioritized',
        description: `Assigned priority: ${result.data.priorityLevel.toUpperCase()}`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
    setIsSubmitting(false);
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

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">New Emergency Request</CardTitle>
            <CardDescription>
              Enter a request from SMS or voice transcription to prioritize it with AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="requestText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Man fell from building at Sqa Al-Arabi, he is not moving...'"
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Prioritize Request
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Prioritized Requests Queue</CardTitle>
            <CardDescription>
              List of incoming emergency requests, sorted by priority and time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Request Details</TableHead>
                            <TableHead className="w-[120px] text-center">Priority</TableHead>
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
      </div>
    </div>
  );
}
