'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomer } from '@paykit-sdk/react';
import { Button, Badge, Input, Dialog, Label } from '@paykit-sdk/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Edit3, Loader2, X } from 'lucide-react';
import * as RHF from 'react-hook-form';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerInfoModalProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerInfoModal = ({ customerId, open, onOpenChange }: CustomerInfoModalProps) => {
  const queryClient = useQueryClient();
  const { retrieve, update } = useCustomer();
  const [isEditing, setIsEditing] = React.useState(false);

  const form = RHF.useForm<CustomerFormData>({ resolver: zodResolver(customerSchema), defaultValues: { name: '', email: '' } });

  // Fetch customer data with React Query
  const customerQuery = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const result = await retrieve.run(customerId);
      return result.data || null;
    },
    enabled: !!customerId && open,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      if (!customerId) throw new Error('No customer ID');
      const result = await update.run(customerId, data);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      setIsEditing(false);
    },
  });

  // Initialize form when customer data loads
  React.useEffect(() => {
    if (customerQuery.data) {
      form.reset({ name: customerQuery.data.name || '', email: customerQuery.data.email || '' });
    }
  }, [customerQuery.data, form.reset()]);

  const onSubmit = (data: CustomerFormData) => {
    updateCustomerMutation.mutate(data);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (customerQuery.data) form.reset({ name: customerQuery.data.name || '', email: customerQuery.data.email || '' });
  };

  if (!customerId) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title className="flex items-center gap-2">
            <User className="text-primary h-5 w-5" />
            Customer Details
          </Dialog.Title>
          <Dialog.Close asChild>
            <Button variant="ghost" size="sm" className="absolute top-4 right-4">
              <X className="h-4 w-4" />
            </Button>
          </Dialog.Close>
        </Dialog.Header>

        <div className="space-y-6">
          {customerQuery.isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-primary h-6 w-6 animate-spin" />
              <span className="text-muted-foreground ml-2 text-sm">Loading customer data...</span>
            </div>
          )}

          {customerQuery.error && (
            <div className="border-destructive/20 bg-destructive/10 rounded-lg border p-4">
              <p className="text-destructive text-sm">Failed to load customer data. Please try again.</p>
            </div>
          )}

          {customerQuery.data && (
            <>
              {/* Customer Status */}
              <div className="flex items-center justify-between">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active Customer
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} disabled={updateCustomerMutation.isPending}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              {!isEditing ? (
                /* View Mode */
                <div className="space-y-4">
                  <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                    <User className="text-muted-foreground h-5 w-5" />
                    <div>
                      <p className="font-medium">{customerQuery.data.name}</p>
                      <p className="text-muted-foreground text-xs">Full Name</p>
                    </div>
                  </div>

                  {customerQuery.data.email && (
                    <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                      <Mail className="text-muted-foreground h-5 w-5" />
                      <div>
                        <p className="font-medium">{customerQuery.data.email}</p>
                        <p className="text-muted-foreground text-xs">Email Address</p>
                      </div>
                    </div>
                  )}

                  {/* Customer ID */}
                  <div className="border-t pt-4">
                    <p className="text-muted-foreground text-xs">Customer ID</p>
                    <p className="font-mono text-sm">{customerId}</p>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <RHF.Controller
                      name="name"
                      control={form.control}
                      render={({ field, fieldState: { error } }) => (
                        <div className="flex flex-col gap-2">
                          <Input {...field} placeholder="Enter customer name" className="mt-1" />
                          {error && <p className="text-destructive mt-1 text-xs">{error.message}</p>}
                        </div>
                      )}
                    />
                    {form.formState.errors.name && <p className="text-destructive mt-1 text-xs">{form.formState.errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <RHF.Controller
                      name="email"
                      control={form.control}
                      render={({ field, fieldState: { error } }) => (
                        <div className="flex flex-col gap-2">
                          <Input {...field} type="email" placeholder="Enter email address" className="mt-1" />
                          {error && <p className="text-destructive mt-1 text-xs">{error.message}</p>}
                        </div>
                      )}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={updateCustomerMutation.isPending} className="flex-1">
                      {updateCustomerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={updateCustomerMutation.isPending}>
                      Cancel
                    </Button>
                  </div>

                  {updateCustomerMutation.error && (
                    <div className="border-destructive/20 bg-destructive/10 rounded-lg border p-3">
                      <p className="text-destructive text-sm">{updateCustomerMutation.error.message}</p>
                    </div>
                  )}
                </form>
              )}
            </>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
