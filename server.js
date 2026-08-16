const http = require('http');
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

const rootDir = __dirname;
const publicDir = fs.existsSync(path.join(rootDir, 'front_end'))
  ? path.join(rootDir, 'front_end')
  : rootDir;

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const [key, ...valueParts] = trimmed.split('=');
    if (key) {
      process.env[key.trim()] = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  }
}

loadEnv();

const PORT = Number(process.env.PORT) || 3000;
const dataFile = process.env.DB_FILE
  ? path.resolve(rootDir, process.env.DB_FILE)
  : path.join(rootDir, 'data', 'users.json');

const dataDir = path.dirname(dataFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, '[]', 'utf8');
}

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
}

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

function createToken(email) {
  return createHash('sha256').update(`${email}:${Date.now()}`).digest('hex');
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.png': return 'image/png';
    case '.jpg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

function serveStatic(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: 'File not found' });
      return;
    }

    res.writeHead(200, {
      'Content-Type': getContentType(filePath),
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname;

  if (pathname === '/api/health') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  if (pathname === '/api/register' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const role = String(body.role || '').trim().toLowerCase();
      const password = String(body.password || '');
      
      console.log(role)

      if (!name || !email || !password ) {
        sendJson(res, 400, { error: 'All fields are required' });
        return;
      }

      const users = readUsers();
      if (users.some(user => user.email === email)) {
        sendJson(res, 409, { error: 'An account with this email already exists' });
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: hashPassword(password),
        role,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      writeUsers(users);

      const token = createToken(email);

      sendJson(res, 201, {
        message: 'Registration successful',
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Registration failed' });
    }
    return;
  }

  if (pathname === '/api/login' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (!email || !password) {
        sendJson(res, 400, { error: 'Email and password are required' });
        return;
      }

      const users = readUsers();
      const user = users.find(item => item.email === email);

      if (!user || user.password !== hashPassword(password)) {
        sendJson(res, 401, { error: 'Invalid email or password' });
        return;
      }

      const token = createToken(email);

      sendJson(res, 200, {
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Login failed' });
    }
    return;
  }

  const requestPath = pathname === '/' ? '/index.html' : pathname;
  const relativePath = requestPath.replace(/^\/+/, '');
  const filePath = path.resolve(publicDir, relativePath);

  if (!filePath.startsWith(publicDir)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    serveStatic(res, filePath);
    return;
  }

  if (fs.existsSync(path.join(publicDir, 'index.html'))) {
    serveStatic(res, path.join(publicDir, 'index.html'));
    return;
  }

  sendJson(res, 404, { error: 'Page not found' });
});

server.listen(PORT, () => {
  console.log(`mediCare server running at http://localhost:${PORT}`);
});