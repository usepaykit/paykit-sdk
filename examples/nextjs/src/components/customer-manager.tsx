'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomer } from '@paykit-sdk/react';
import { Button, Card, Input, Badge, Label } from '@paykit-sdk/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, UserPlus, Edit3, Loader2, Search } from 'lucide-react';
import * as RHF from 'react-hook-form';
import { z } from 'zod';

// Zod schemas
const retrieveCustomerSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
});

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

const updateCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type RetrieveCustomerData = z.infer<typeof retrieveCustomerSchema>;
type CreateCustomerData = z.infer<typeof createCustomerSchema>;
type UpdateCustomerData = z.infer<typeof updateCustomerSchema>;

export const CustomerManager = () => {
  const queryClient = useQueryClient();
  const { retrieve, create, update } = useCustomer();
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [retrievedCustomer, setRetrievedCustomer] = React.useState<any>(null);
  const [currentCustomerId, setCurrentCustomerId] = React.useState<string>('');

  // Form setup
  const retrieveForm = RHF.useForm<RetrieveCustomerData>({
    resolver: zodResolver(retrieveCustomerSchema),
    defaultValues: { customerId: '' },
  });

  const createForm = RHF.useForm<CreateCustomerData>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: { name: '', email: '' },
  });

  const updateForm = RHF.useForm<UpdateCustomerData>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: { name: '', email: '' },
  });

  // Mutations
  const retrieveMutation = useMutation({
    mutationFn: async (data: RetrieveCustomerData) => {
      const result = await retrieve.run(data.customerId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: data => {
      setRetrievedCustomer(data);
      setCurrentCustomerId(retrieveForm.getValues('customerId'));
      // Pre-fill update form with retrieved data
      updateForm.reset({
        name: data?.name || '',
        email: data?.email || '',
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateCustomerData) => {
      const result = await create.run(data);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      createForm.reset();
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCustomerData) => {
      if (!currentCustomerId) throw new Error('No customer selected');
      const result = await update.run(currentCustomerId, data);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: data => {
      setRetrievedCustomer(data);
      queryClient.invalidateQueries({ queryKey: ['customer', currentCustomerId] });
    },
  });

  // Form handlers
  const onRetrieveSubmit = (data: RetrieveCustomerData) => {
    retrieveMutation.mutate(data);
  };

  const onCreateSubmit = (data: CreateCustomerData) => {
    createMutation.mutate(data);
  };

  const onUpdateSubmit = (data: UpdateCustomerData) => {
    updateMutation.mutate(data);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    createForm.reset();
  };

  return (
    <Card.Root className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <User className="text-primary h-5 w-5" />
        <h2 className="text-xl font-semibold">Customer Management</h2>
      </div>

      <div className="space-y-6">
        {/* Retrieve Customer */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium">Retrieve Customer</h3>
          <form onSubmit={retrieveForm.handleSubmit(onRetrieveSubmit)} className="space-y-3">
            <div className="space-y-2">
              <Label>Customer ID</Label>
              <RHF.Controller
                name="customerId"
                control={retrieveForm.control}
                render={({ field, fieldState: { error } }) => (
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <Input {...field} placeholder="Enter customer ID" className="flex-1" />
                      <Button type="submit" disabled={retrieveMutation.isPending} size="sm">
                        {retrieveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                    {error && <p className="text-destructive text-xs">{error.message}</p>}
                  </div>
                )}
              />
            </div>
          </form>

          {retrieveMutation.error && (
            <div className="border-destructive/20 bg-destructive/10 rounded-lg border p-3">
              <p className="text-destructive text-sm">{retrieveMutation.error.message}</p>
            </div>
          )}

          {retrievedCustomer && (
            <div className="bg-muted rounded-lg p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{retrievedCustomer.name}</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <p className="text-muted-foreground text-sm">{retrievedCustomer.email}</p>
              <p className="text-muted-foreground mt-1 text-xs">ID: {currentCustomerId}</p>
            </div>
          )}
        </div>

        {/* Create Customer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-muted-foreground text-sm font-medium">Create Customer</h3>
            <Button variant="outline" size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
              <UserPlus className="mr-2 h-4 w-4" />
              {showCreateForm ? 'Cancel' : 'New Customer'}
            </Button>
          </div>

          {showCreateForm && (
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-3 rounded-lg border p-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <RHF.Controller
                  name="name"
                  control={createForm.control}
                  render={({ field, fieldState: { error } }) => (
                    <div className="space-y-1">
                      <Input {...field} placeholder="Enter customer name" />
                      {error && <p className="text-destructive text-xs">{error.message}</p>}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <RHF.Controller
                  name="email"
                  control={createForm.control}
                  render={({ field, fieldState: { error } }) => (
                    <div className="space-y-1">
                      <Input {...field} type="email" placeholder="Enter email address" />
                      {error && <p className="text-destructive text-xs">{error.message}</p>}
                    </div>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Customer'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelCreate} disabled={createMutation.isPending}>
                  Cancel
                </Button>
              </div>

              {createMutation.error && (
                <div className="border-destructive/20 bg-destructive/10 rounded-lg border p-3">
                  <p className="text-destructive text-sm">{createMutation.error.message}</p>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Update Customer */}
        {retrievedCustomer && (
          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm font-medium">Update Customer</h3>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-3 rounded-lg border p-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <RHF.Controller
                  name="name"
                  control={updateForm.control}
                  render={({ field, fieldState: { error } }) => (
                    <div className="space-y-1">
                      <Input {...field} placeholder="Enter customer name" />
                      {error && <p className="text-destructive text-xs">{error.message}</p>}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <RHF.Controller
                  name="email"
                  control={updateForm.control}
                  render={({ field, fieldState: { error } }) => (
                    <div className="space-y-1">
                      <Input {...field} type="email" placeholder="Enter email address" />
                      {error && <p className="text-destructive text-xs">{error.message}</p>}
                    </div>
                  )}
                />
              </div>

              <Button type="submit" disabled={updateMutation.isPending} variant="outline" className="w-full">
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Update Customer
                  </>
                )}
              </Button>

              {updateMutation.error && (
                <div className="border-destructive/20 bg-destructive/10 rounded-lg border p-3">
                  <p className="text-destructive text-sm">{updateMutation.error.message}</p>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </Card.Root>
  );
};
