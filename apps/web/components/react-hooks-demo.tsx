import { CodeBlock } from '@/components/code-block';

const code = `
import { useCheckout } from '@paykit-sdk/react';

export function PaymentForm() {
const { create } = useCheckout();

const handlePayment = async () => {
  const [checkout, error] = await create.run({
    customer_id: 'cus_123',
    item_id: 'price_123',
    session_type: 'one_time',
    metadata: { plan: 'pro' }
  });

  if (error) return;
  
  window.location.href = checkout.payment_url;
}
`;

export const ReactHooksDemo = () => {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              React hooks for
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">seamless integration</span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Use familiar React patterns with PayKit’s hooks. Type-safe, async-first, and provider-agnostic.
            </p>
          </div>

          <div className="bg-muted/20 relative mx-auto mt-12 max-w-2xl rounded-2xl border p-1">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
            <div className="bg-background relative space-y-6 rounded-xl">
              <CodeBlock customStyle={{ width: '100%' }} showCopyButton={false} language="typescript" filename="components/payment-form.tsx">
                {code}
              </CodeBlock>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
