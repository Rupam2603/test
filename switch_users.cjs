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
              const buttons = Array.from(document.querySelectorAll('button, div, a, span'));
              const usersBtn = buttons.find(b => b.textContent && b.textContent.trim().toLowerCase() === 'users');
              if (usersBtn) {
                usersBtn.click();
                return 'Clicked Users tab';
              }
              return 'Users tab not found';
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
