export const LocalCheckoutSession = () => {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <div className="text-center">
            <h2 className="text-foreground mb-6 text-4xl font-bold md:text-5xl">Your payment backend lives in a file</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Configure your payment logic in a single file and test locally with PayKit's development provider
            </p>
          </div>

          <div className="bg-muted/20 relative mt-7 rounded-2xl border p-1">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20"></div>
            <div className="bg-background relative space-y-6 rounded-xl p-8 md:p-12">
              {/* Browser Chrome */}
              <div className="mx-auto max-w-4xl">
                <div className="bg-muted rounded-t-lg border p-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="bg-background text-muted-foreground flex-1 rounded px-3 py-1 text-xs">
                      http://localhost:3001/checkout?id=eyiou...
                    </div>
                  </div>
                </div>

                {/* Checkout Preview */}
                <div className="bg-background rounded-b-lg border border-t-0 p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Form Preview */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-left font-semibold">Secure Checkout</h3>
                        <p className="text-muted-foreground text-left text-sm">Powered by PayKit Local Provider</p>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-muted/30 rounded-lg border p-3">
                          <div className="mb-2 text-left text-xs font-medium">Customer Information</div>
                          <div className="space-y-2">
                            <div className="bg-background text-muted-foreground h-6 rounded border px-2 py-1 text-xs">john@example.com</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-background text-muted-foreground h-6 rounded border px-2 py-1 text-xs">John</div>
                              <div className="bg-background text-muted-foreground h-6 rounded border px-2 py-1 text-xs">Doe</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/30 rounded-lg border p-3">
                          <div className="mb-2 text-left text-xs font-medium">Payment Method</div>
                          <div className="bg-background text-muted-foreground h-6 rounded border px-2 py-1 text-xs">4242 4242 4242 4242</div>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary Preview */}
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg border p-4">
                        <div className="mb-3 text-left text-xs font-medium">Order Summary</div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">PayKit Pro License</span>
                            <span className="font-medium">$99.00</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Local provider fee</span>
                            <span className="font-medium text-green-600">$0.00</span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between text-sm font-bold">
                              <span>Total</span>
                              <span>$99.00</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="bg-primary text-primary-foreground w-full rounded px-3 py-2 text-center text-xs font-medium">
                            Complete Payment - $99.00
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
