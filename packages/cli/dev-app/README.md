# PayKit CLI Dev App

A development checkout page for testing PayKit payments locally.

## Features

- Checkout Interface: Complete payment form with customer info and product details
- Automatic Redirect: After successful payment, users are redirected back to their original location
- Webhook Testing: Simulates real payment events for testing your webhook handlers
- Local Provider: Uses PayKit's local provider for seamless development

## How It Works

1. Referrer Detection: When users visit the checkout page, the app reads the `referer` header from their browser
2. Payment Processing: Users complete payment using the checkout form
3. Webhook Events: The app sends webhook events to the referrer's API route to simulate real payment processing
4. Automatic Redirect: After successful payment, users are automatically redirected back to where they came from

## Usage

The dev app is automatically started when you run `npx @paykit-sdk/cli dev` and is accessible at `http://localhost:3001`.

## Redirect Behavior

- If a referrer is detected, users are redirected back after payment
- If no referrer is available, users stay on the checkout page and see a success message
