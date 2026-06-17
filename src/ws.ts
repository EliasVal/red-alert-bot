import WebSocket from 'ws';

const url = 'wss://ws.tzevaadom.co.il/socket?platform=WEB';
let ws;
let reconnectDelay = 1000; // Start with 1 second

export function connect(onMessage: (data: any) => void) {
  console.log('Connecting...');

  ws = new WebSocket(url, {
    headers: {
      Origin: 'https://www.tzevaadom.co.il',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  ws.on('open', () => {
    console.log('Connected successfully!');
    reconnectDelay = 1000; // Reset delay on successful connection
  });

  ws.on('message', (data) => {
    console.log('Received:', data.toString());
    onMessage(data);
  });

  ws.on('error', (error) => {
    console.error('WebSocket Error:', error.message);
  });

  ws.on('close', (code, reason) => {
    console.log(`Connection closed (${code}). Reconnecting in ${reconnectDelay / 1000}s...`);

    setTimeout(() => {
      // Exponential backoff capped at 30 seconds
      reconnectDelay = Math.min(reconnectDelay * 2, 30000);
      connect(onMessage);
    }, reconnectDelay);
  });
}
