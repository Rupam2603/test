const http = require('http');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const pages = JSON.parse(data);
    const page = pages[0];
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (async () => {
              try {
                const { fetchDbAllUsers } = await import('/src/services/db.js').catch(async () => {
                  return await import('./services/db.js');
                });
                const users = await fetchDbAllUsers();
                return {
                  total: users.length,
                  users: users.map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    approvalStatus: u.approvalStatus,
                    shopName: u.shopName,
                    source: u._source
                  }))
                };
              } catch (e) {
                return { error: e.message, stack: e.stack };
              }
            })()
          `,
          awaitPromise: true,
          returnByValue: true
        }
      }));
    });

    ws.addEventListener('message', (event) => {
      console.log('Users in app:', JSON.stringify(JSON.parse(event.data), null, 2));
      setTimeout(() => {
        ws.close();
        process.exit(0);
      }, 1000);
    });
  });
});
