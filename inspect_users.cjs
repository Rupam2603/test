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
            (() => {
              // Inspect all elements containing test_pending or approval or pending
              const text = document.body.innerText;
              return {
                hasPendingText: text.includes('pending') || text.includes('Pending'),
                bodySnippet: text.slice(0, 1000)
              };
            })()
          `,
          returnByValue: true
        }
      }));
    });

    ws.addEventListener('message', (event) => {
      console.log('Result:', JSON.stringify(JSON.parse(event.data), null, 2));
      setTimeout(() => {
        ws.close();
        process.exit(0);
      }, 1000);
    });
  });
});
