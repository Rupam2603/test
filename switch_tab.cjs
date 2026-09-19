const http = require('http');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const pages = JSON.parse(data);
    const page = pages[0];
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.addEventListener('open', () => {
      // Switch tab to Stores or Users
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (() => {
              // Find stores nav button
              const buttons = Array.from(document.querySelectorAll('button, div, a, span'));
              const storesBtn = buttons.find(b => b.textContent && b.textContent.trim().toLowerCase() === 'stores');
              if (storesBtn) {
                storesBtn.click();
                return 'Clicked Stores tab';
              }
              const usersBtn = buttons.find(b => b.textContent && b.textContent.trim().toLowerCase() === 'users');
              if (usersBtn) {
                usersBtn.click();
                return 'Clicked Users tab';
              }
              return 'Tab not found';
            })()
          `
        }
      }));
    });

    ws.addEventListener('message', (event) => {
      console.log('Result:', event.data);
      setTimeout(() => {
        ws.close();
        process.exit(0);
      }, 1000);
    });
  });
});
