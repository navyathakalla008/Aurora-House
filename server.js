/**
 * Local server – serves the site and stores submissions in data/submissions.json
 * Run: node server.js  then open http://localhost:3000
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const CHILDREN_FILE = path.join(DATA_DIR, 'children.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

const DEFAULT_USERS = [
    { id: 'demo-user', name: 'Demo User', email: 'user@aurorahouse.org', password: 'AuroraUser2024' }
];

function readUsers() {
    ensureDataFile();
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_USERS, null, 2), 'utf8');
    }
    try {
        const list = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        if (!Array.isArray(list) || list.length === 0) {
            writeUsers(DEFAULT_USERS);
            return DEFAULT_USERS.slice();
        }
        return list;
    } catch {
        return DEFAULT_USERS.slice();
    }
}

function writeUsers(list) {
    ensureDataFile();
    fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf8');
}

function findUserByEmail(users, email) {
    const e = normalizeEmail(email);
    return users.find(u => normalizeEmail(u.email) === e);
}

function publicUser(user) {
    return { id: user.id, name: user.name, email: user.email };
}

const DEFAULT_CHILDREN = [
    { id: '1', name: 'Emma', age: 5, gender: 'Female', status: 'available', image: 'https://images.unsplash.com/photo-1503454537845-cef01fcb6237?w=500&h=500&fit=crop&q=80', availableSince: '2023', description: 'Sweet and energetic, loves art and outdoor activities.', needs: 'Loving Home', personality: 'Emma loves art and outdoor play.', interests: ['Art', 'Music'], healthStatus: 'Good', healthReports: [], videos: [] },
    { id: '2', name: 'James', age: 8, gender: 'Male', status: 'available', image: 'https://images.unsplash.com/photo-1503919502593-69336414efae?w=500&h=500&fit=crop&q=80', availableSince: '2022', description: 'Bright and curious, enjoys reading and science.', needs: 'Supportive Family', personality: 'James loves science and reading.', interests: ['Reading', 'Science'], healthStatus: 'Good', healthReports: [], videos: [] },
    { id: '3', name: 'Sophia', age: 6, gender: 'Female', status: 'available', image: 'https://images.unsplash.com/photo-1544776193-352d792451e9?w=500&h=500&fit=crop&q=80', availableSince: '2023', description: 'Creative and musical, loves singing and dancing.', needs: 'Creative Environment', personality: 'Sophia loves music and dance.', interests: ['Music', 'Dancing'], healthStatus: 'Good', healthReports: [], videos: [] }
];

const MIME = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

function ensureDataFile() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(SUBMISSIONS_FILE)) {
        fs.writeFileSync(SUBMISSIONS_FILE, '[]', 'utf8');
    }
}

function readSubmissions() {
    ensureDataFile();
    try {
        return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function writeSubmissions(list) {
    ensureDataFile();
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
}

function readChildren() {
    ensureDataFile();
    if (!fs.existsSync(CHILDREN_FILE)) {
        fs.writeFileSync(CHILDREN_FILE, JSON.stringify(DEFAULT_CHILDREN, null, 2), 'utf8');
    }
    try {
        return JSON.parse(fs.readFileSync(CHILDREN_FILE, 'utf8'));
    } catch {
        return DEFAULT_CHILDREN;
    }
}

function writeChildren(list) {
    ensureDataFile();
    fs.writeFileSync(CHILDREN_FILE, JSON.stringify(list, null, 2), 'utf8');
}

function send(res, status, body, type = 'application/json') {
    res.writeHead(status, {
        'Content-Type': type,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') {
        send(res, 204, '');
        return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (url.pathname === '/api/submissions' && req.method === 'GET') {
        send(res, 200, readSubmissions());
        return;
    }

    if (url.pathname === '/api/submissions' && req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const list = JSON.parse(body);
                if (!Array.isArray(list)) {
                    send(res, 400, { error: 'Expected array' });
                    return;
                }
                writeSubmissions(list);
                send(res, 200, list);
            } catch (e) {
                send(res, 400, { error: 'Invalid JSON' });
            }
        });
        return;
    }

    if (url.pathname === '/api/submissions' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const entry = JSON.parse(body);
                const list = readSubmissions();
                list.unshift(entry);
                writeSubmissions(list);
                send(res, 201, entry);
            } catch (e) {
                send(res, 400, { error: 'Invalid JSON' });
            }
        });
        return;
    }

    if (url.pathname === '/api/submissions/read' && req.method === 'PATCH') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { id } = JSON.parse(body);
                const list = readSubmissions().map(s =>
                    s.id === id ? { ...s, read: true } : s
                );
                writeSubmissions(list);
                send(res, 200, { ok: true });
            } catch (e) {
                send(res, 400, { error: 'Invalid request' });
            }
        });
        return;
    }

    if (url.pathname === '/api/submissions/update' && req.method === 'PATCH') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { id, patch } = JSON.parse(body);
                const list = readSubmissions().map(s =>
                    s.id === id ? { ...s, ...patch, data: { ...s.data, ...(patch.data || {}) } } : s
                );
                writeSubmissions(list);
                const updated = list.find(s => s.id === id);
                send(res, 200, updated || { ok: true });
            } catch (e) {
                send(res, 400, { error: 'Invalid request' });
            }
        });
        return;
    }

    if (url.pathname === '/api/children' && req.method === 'GET') {
        send(res, 200, readChildren());
        return;
    }

    if (url.pathname === '/api/children' && req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const children = JSON.parse(body);
                writeChildren(children);
                send(res, 200, children);
            } catch (e) {
                send(res, 400, { error: 'Invalid JSON' });
            }
        });
        return;
    }

    if (url.pathname === '/api/auth/register' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { name, email, password } = JSON.parse(body);
                const normEmail = normalizeEmail(email);
                if (!name || !normEmail || !password) {
                    send(res, 400, { ok: false, message: 'Name, email, and password are required.' });
                    return;
                }
                const users = readUsers();
                if (findUserByEmail(users, normEmail)) {
                    send(res, 409, { ok: false, message: 'An account with this email already exists.' });
                    return;
                }
                const user = {
                    id: String(Date.now()),
                    name: String(name).trim(),
                    email: normEmail,
                    password: String(password)
                };
                users.push(user);
                writeUsers(users);
                send(res, 201, { ok: true, user: publicUser(user) });
            } catch (e) {
                send(res, 400, { ok: false, message: 'Invalid request' });
            }
        });
        return;
    }

    if (url.pathname === '/api/auth/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { email, password } = JSON.parse(body);
                const user = findUserByEmail(readUsers(), email);
                if (!user) {
                    send(res, 404, { ok: false, code: 'not_found', message: 'No account found.' });
                    return;
                }
                if (user.password !== String(password)) {
                    send(res, 401, { ok: false, code: 'bad_password', message: 'Invalid email or password.' });
                    return;
                }
                send(res, 200, { ok: true, user: publicUser(user) });
            } catch (e) {
                send(res, 400, { ok: false, message: 'Invalid request' });
            }
        });
        return;
    }

    if (url.pathname === '/api/auth/sync' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { id, name, email, password } = JSON.parse(body);
                const normEmail = normalizeEmail(email);
                if (!normEmail || !password) {
                    send(res, 400, { ok: false });
                    return;
                }
                const users = readUsers();
                if (findUserByEmail(users, normEmail)) {
                    send(res, 200, { ok: true });
                    return;
                }
                users.push({
                    id: id || String(Date.now()),
                    name: String(name || '').trim(),
                    email: normEmail,
                    password: String(password)
                });
                writeUsers(users);
                send(res, 200, { ok: true });
            } catch (e) {
                send(res, 400, { ok: false });
            }
        });
        return;
    }

    let filePath = path.join(ROOT, url.pathname === '/' ? 'index.html' : url.pathname);
    if (!filePath.startsWith(ROOT)) {
        send(res, 403, { error: 'Forbidden' });
        return;
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }
    if (!fs.existsSync(filePath)) {
        send(res, 404, 'Not found', 'text/plain');
        return;
    }

    const ext = path.extname(filePath);
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
});

ensureDataFile();
server.listen(PORT, () => {
    console.log(`Aurora House running at http://localhost:${PORT}`);
    console.log(`Admin: http://localhost:${PORT}/admin-login.html`);
});
