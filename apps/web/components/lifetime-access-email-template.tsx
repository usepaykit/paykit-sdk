import React from 'react';
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components';

export const LifetimeAccessEmail = () => {
  return (
    <Html>
      <Head />
      <Preview>Thanks for supporting PayKit — you now have lifetime access!</Preview>
      <Body tw="bg-[oklch(0.9911 0 0)] font-sans">
        <Container tw="mx-auto max-w-2xl px-6 py-12">
          <Section tw="bg-[oklch(0.9911 0 0)] rounded-lg border border-[oklch(0.9037 0 0)] p-8 shadow-lg">
            {/* Header */}
            <Section tw="text-center mb-8">
              <Heading tw="text-[oklch(0.2046 0 0)] text-3xl font-bold mb-4">Thanks for supporting PayKit</Heading>
              <Text tw="text-[oklch(0.2435 0 0)] text-lg">You now have lifetime access to everything we’re building, forever.</Text>
            </Section>

            {/* Main Content */}
            <Section tw="mb-8">
              <Text tw="text-[oklch(0.2046 0 0)] text-base leading-relaxed mb-4">No limits. No subscriptions. Just one-time peace of mind.</Text>

              <Text tw="text-[oklch(0.2046 0 0)] text-base leading-relaxed mb-6">
                When V2 is launched, you’ll get a ping with your login link and full access to the cloud features.
              </Text>

              <Text tw="text-[oklch(0.2046 0 0)] text-base leading-relaxed">
                If you ever need anything or have ideas&rsquo; feel free to reply — we’re listening! 🙏
              </Text>
            </Section>

            {/* Footer */}
            <Section tw="border-t border-[oklch(0.9037 0 0)] pt-6">
              <Text tw="text-[oklch(0.2046 0 0)] text-base mb-2">Cheers&rsquo;</Text>
              <Text tw="text-[oklch(0.2046 0 0)] text-base font-semibold">Odii</Text>
              <Text tw="text-[oklch(0.2435 0 0)] text-sm">Maker&rsquo; PayKit</Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default LifetimeAccessEmail;
