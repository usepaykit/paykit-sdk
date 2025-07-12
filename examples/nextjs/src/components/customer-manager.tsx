'use client';

import * as React from 'react';
import { useCustomer } from '@paykit-sdk/react';
import { Button, Card, Input, Badge } from '@paykit-sdk/ui';
import { User, UserPlus, Edit3, Loader2 } from 'lucide-react';

export function CustomerManager() {
  const [customerId, setCustomerId] = React.useState('');
  const [customerForm, setCustomerForm] = React.useState({ name: '', email: '', phone: '' });
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const { retrieve, create, update } = useCustomer();

  const handleRetrieve = async () => {
    if (!customerId) return;
    await retrieve.run(customerId);
  };

  const handleCreate = async () => {
    if (!customerForm.name || !customerForm.email) return;
    const result = await create.run(customerForm);
    if (result.data) {
      setCustomerForm({ name: '', email: '', phone: '' });
      setShowCreateForm(false);
    }
  };

  const handleUpdate = async () => {
    if (!customerId || !customerForm.name) return;
    await update.run(customerId, customerForm);
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
          <div className="flex gap-2">
            <Input placeholder="Customer ID" value={customerId} onChange={e => setCustomerId(e.target.value)} className="flex-1" />
            <Button onClick={handleRetrieve} disabled={retrieve.loading || !customerId}>
              {retrieve.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Retrieve'}
            </Button>
          </div>
          {retrieve.data && (
            <div className="bg-muted rounded-lg p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{retrieve.data.name}</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <p className="text-muted-foreground text-sm">{retrieve.data.email}</p>
              {retrieve.data.phone && <p className="text-muted-foreground text-sm">{retrieve.data.phone}</p>}
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
            <div className="space-y-3 rounded-lg border p-4">
              <Input
                placeholder="Customer Name"
                value={customerForm.name}
                onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
              />
              <Input
                placeholder="Email Address"
                type="email"
                value={customerForm.email}
                onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
              />
              <Input
                placeholder="Phone Number (optional)"
                value={customerForm.phone}
                onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
              />
              <Button onClick={handleCreate} disabled={create.loading || !customerForm.name || !customerForm.email} className="w-full">
                {create.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Customer
              </Button>
            </div>
          )}
        </div>

        {/* Update Customer */}
        {retrieve.data && (
          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm font-medium">Update Customer</h3>
            <div className="space-y-3 rounded-lg border p-4">
              <Input placeholder="New Name" value={customerForm.name} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} />
              <Input
                placeholder="New Email"
                type="email"
                value={customerForm.email}
                onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
              />
              <Button onClick={handleUpdate} disabled={update.loading || !customerForm.name} variant="outline" className="w-full">
                {update.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit3 className="mr-2 h-4 w-4" />}
                Update Customer
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card.Root>
  );
}
