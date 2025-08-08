# PayKit UI

A collection of reusable UI components built with React, Tailwind CSS, and Radix UI primitives.

## Installation

```bash
npm install @paykit-sdk/ui
```

## Setup

Add the following to your global CSS file (e.g., `globals.css`, `app.css`, or `index.css`):

```css
@import '@paykit-sdk/ui/dist/output.css';
```

## Usage

```tsx
import { Button, Card, Input, Badge } from '@paykit-sdk/ui';

function PaymentForm() {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Payment Form</h2>
      <div className="space-y-4">
        <Input placeholder="Enter amount" />
        <Button>Process Payment</Button>
        <Badge variant="secondary">Secure</Badge>
      </div>
    </Card>
  );
}
```
