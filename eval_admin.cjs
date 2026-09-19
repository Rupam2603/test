const http = require('http');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const pages = JSON.parse(data);
    const page = pages[0];
    if (!page) {
      console.log('No page found');
      return;
    }
    console.log('Target WebSocket URL:', page.webSocketDebuggerUrl);
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.addEventListener('open', () => {
      console.log('Connected via standard WebSocket!');
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (() => {
              const emailInput = document.querySelector('input[type="email"]');
              const passInput = document.querySelector('input[type="password"]');
              if (emailInput && passInput) {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeInputValueSetter.call(emailInput, 'subhonehealthgroup@gmail.com');
                emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                nativeInputValueSetter.call(passInput, 'admin123');
                passInput.dispatchEvent(new Event('input', { bubbles: true }));

                const submitBtn = document.querySelector('button[type="submit"]');
                if (submitBtn) {
                  submitBtn.click();
                  return 'Credentials set and submit clicked';
                }
              }
              return 'Elements not found';
            })()
          `
        }
      }));
    });

    ws.addEventListener('message', (event) => {
      console.log('CDP message:', event.data);
      setTimeout(() => {
        ws.close();
        process.exit(0);
      }, 1000);
    });
  });
});
