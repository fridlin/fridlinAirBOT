const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Node.js Starter</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        h1 {
          font-size: 3rem;
          margin: 0 0 1rem 0;
        }
        p {
          font-size: 1.2rem;
          opacity: 0.9;
        }
        .emoji {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">🚀</div>
        <h1>Node.js Starter</h1>
        <p>Your Express server is running on port ${PORT}</p>
      </div>
    </body>
    </html>
  `);
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Node.js!', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
