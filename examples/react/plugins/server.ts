export const serverPlugin = () => ({
  name: 'mock-webhook',
  configureServer(server: any) {
    server.middlewares.use('/webhook', async (req: any, res: any, next: any) => {
      console.log('mock..');
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            console.log('🔔 Webhook received:', payload);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Webhook received' }));
          } catch (error) {
            console.error('❌ Webhook error:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
          }
        });
      } else {
        next();
      }
    });
  },
});
