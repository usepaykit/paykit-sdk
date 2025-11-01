import { Card, buttonVariants, cn } from '@paykit-sdk/ui';
import { Mail, MessageCircle, Handshake } from 'lucide-react';

export const SponsorContact = () => {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Handshake className="text-primary h-6 w-6" />
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Sponsorships, Partnerships & Integrations
            </h2>
          </div>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
            Interested in sponsoring PayKit, building a partnership, or integrating your
            payment provider? Let&apos;s connect and explore opportunities together.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card.Root className="border-2">
            <Card.Header>
              <div className="mb-1 flex items-center gap-2">
                <Handshake className="text-primary h-5 w-5" />
                <Card.Title className="text-lg">Sponsorships</Card.Title>
              </div>
              <Card.Description>
                Support PayKit&apos;s development and get visibility in our ecosystem
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <a
                href="mailto:emmanuelodii80@gmail.com?subject=Sponsorship Inquiry"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'w-full',
                )}
              >
                <Mail className="mr-2 h-4 w-4" />
                Get in Touch
              </a>
            </Card.Content>
          </Card.Root>

          <Card.Root className="border-2">
            <Card.Header>
              <div className="mb-1 flex items-center gap-2">
                <MessageCircle className="text-primary h-5 w-5" />
                <Card.Title className="text-lg">Integrations</Card.Title>
              </div>
              <Card.Description>
                Want to add your payment provider to PayKit? Let&apos;s discuss
                integration
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <a
                href="mailto:emmanuelodii80@gmail.com?subject=Integration Inquiry"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'w-full',
                )}
              >
                <Mail className="mr-2 h-4 w-4" />
                Request Integration
              </a>
            </Card.Content>
          </Card.Root>
        </div>
      </div>
    </section>
  );
};
