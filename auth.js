/**
 * Aurora House – Auth, submissions & shared data
 * Run start-server.bat so submissions and accounts are saved on the server.
 */
const AuroraData = (function () {
    const KEYS = {
        users: 'auroraUsers',
        userSession: 'auroraUserSession',
        adminSession: 'auroraAdminSession',
        submissions: 'auroraSubmissions',
        children: 'auroraChildProfiles'
    };

    const ADMIN_EMAIL = 'admin@aurorahouse.org';
    const ADMIN_PASSWORD = 'AuroraAdmin2024';

    let submissionsCache = [];
    let submissionsLoaded = false;
    const SERVER_ORIGIN = 'http://localhost:3000';

    const PHOTO_EMMA = 'https://images.unsplash.com/photo-1503454537845-cef01fcb6237?w=500&h=500&fit=crop&q=80';
    const PHOTO_JAMES = 'https://images.unsplash.com/photo-1503919502593-69336414efae?w=500&h=500&fit=crop&q=80';
    const PHOTO_SOPHIA = 'https://images.unsplash.com/photo-1544776193-352d792451e9?w=500&h=500&fit=crop&q=80';

    const defaultChildren = [
        { id: '1', name: 'Emma', age: 5, gender: 'Female', status: 'available', image: PHOTO_EMMA, availableSince: '2023', description: 'Sweet and energetic, loves art and outdoor activities.', needs: 'Loving Home', personality: 'Emma loves art and outdoor play.', interests: ['Art', 'Music'], healthStatus: 'Good', healthReports: [{ type: 'General Health', date: '2024-01-15', status: 'Excellent', details: ['All vaccinations up to date', 'Regular checkups completed', 'No chronic conditions'] }], videos: [{ title: "Emma's Daily Activities", description: 'A day in the life of Emma at Aurora House' }] },
        { id: '2', name: 'James', age: 8, gender: 'Male', status: 'available', image: PHOTO_JAMES, availableSince: '2022', description: 'Bright and curious, enjoys reading and science.', needs: 'Supportive Family', personality: 'James loves science and reading.', interests: ['Reading', 'Science'], healthStatus: 'Good', healthReports: [{ type: 'General Health', date: '2024-01-20', status: 'Excellent', details: ['All vaccinations current', 'Healthy growth'] }], videos: [{ title: 'James Reading', description: 'James reading his favorite book' }] },
        { id: '3', name: 'Sophia', age: 6, gender: 'Female', status: 'available', image: PHOTO_SOPHIA, availableSince: '2023', description: 'Creative and musical, loves singing and dancing.', needs: 'Creative Environment', personality: 'Sophia loves music and dance.', interests: ['Music', 'Dancing'], healthStatus: 'Good', healthReports: [{ type: 'General Health', date: '2024-01-18', status: 'Excellent', details: ['Regular checkups', 'Healthy and active'] }], videos: [{ title: "Sophia's Performance", description: 'Sophia singing and dancing' }] }
    ];

    function useServer() {
        return window.location.protocol === 'http:' || window.location.protocol === 'https:';
    }

    function apiUrl(path) {
        return useServer() ? path : `${SERVER_ORIGIN}${path}`;
    }

    async function isBackendAvailable() {
        try {
            const res = await fetch(apiUrl('/api/submissions'));
            return res.ok;
        } catch {
            return false;
        }
    }

    function mergeSubmissionLists(serverList, localList) {
        const byId = new Map();
        [...serverList, ...localList].forEach(s => {
            if (!s || !s.id) return;
            const prev = byId.get(s.id);
            if (!prev || new Date(s.createdAt || 0) >= new Date(prev.createdAt || 0)) {
                byId.set(s.id, s);
            }
        });
        return Array.from(byId.values()).sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
    }

    async function syncSubmissionsToServer(list) {
        try {
            const res = await fetch(apiUrl('/api/submissions'), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(list)
            });
            return res.ok;
        } catch {
            return false;
        }
    }

    function redirectToServerIfNeeded() {
        if (useServer()) return;
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const qs = window.location.search || '';
        fetch(`${SERVER_ORIGIN}/api/submissions`)
            .then(res => {
                if (res.ok) {
                    window.location.replace(`${SERVER_ORIGIN}/${page}${qs}`);
                }
            })
            .catch(() => {});
    }

    function read(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }

    function write(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getSubmissionsLocal() {
        let list = read(KEYS.submissions, null);
        if (!Array.isArray(list) || list.length === 0) {
            try {
                const backup = sessionStorage.getItem(KEYS.submissions);
                if (backup) list = JSON.parse(backup);
            } catch (e) { /* ignore */ }
        }
        return Array.isArray(list) ? list : [];
    }

    function saveSubmissionsLocal(list) {
        write(KEYS.submissions, list);
        try {
            sessionStorage.setItem(KEYS.submissions, JSON.stringify(list));
        } catch (e) { /* ignore */ }
    }

    function notifyUpdated() {
        try {
            window.dispatchEvent(new CustomEvent('aurora-submissions-updated', { detail: { count: submissionsCache.length } }));
        } catch (e) { /* ignore */ }
    }

    async function loadSubmissions() {
        const local = getSubmissionsLocal();
        let serverList = [];

        if (await isBackendAvailable()) {
            try {
                const res = await fetch(apiUrl('/api/submissions'));
                if (res.ok) serverList = await res.json();
            } catch (e) {
                console.warn('Server submissions fetch failed', e);
            }
        }

        const merged = mergeSubmissionLists(
            Array.isArray(serverList) ? serverList : [],
            local
        );
        submissionsCache = merged;
        submissionsLoaded = true;
        saveSubmissionsLocal(merged);

        if (await isBackendAvailable() && merged.length) {
            await syncSubmissionsToServer(merged);
        }

        notifyUpdated();
        return submissionsCache;
    }

    function getSubmissions() {
        if (submissionsLoaded) return submissionsCache;
        return submissionsCache.length ? submissionsCache : getSubmissionsLocal();
    }

    function getUsers() {
        return read(KEYS.users, []);
    }

    function saveUsers(users) {
        write(KEYS.users, users);
    }

    function normalizeEmail(email) {
        return String(email || '').trim().toLowerCase();
    }

    function findLocalUser(email, password) {
        const normEmail = normalizeEmail(email);
        return getUsers().find(u =>
            normalizeEmail(u.email) === normEmail && u.password === String(password)
        );
    }

    function userExistsLocally(email) {
        const normEmail = normalizeEmail(email);
        return getUsers().some(u => normalizeEmail(u.email) === normEmail);
    }

    function nameFromEmail(email) {
        const part = normalizeEmail(email).split('@')[0] || 'user';
        return part
            .replace(/[._+\-]+/g, ' ')
            .split(/\s+/)
            .filter(Boolean)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ') || 'User';
    }

    function upsertLocalUser(user, password) {
        const users = getUsers();
        const normEmail = normalizeEmail(user.email);
        const full = {
            id: user.id,
            name: user.name,
            email: normEmail,
            password: String(password)
        };
        const idx = users.findIndex(u => normalizeEmail(u.email) === normEmail);
        if (idx >= 0) users[idx] = full;
        else users.push(full);
        saveUsers(users);
        return full;
    }

    async function syncUserToServer(user) {
        try {
            await fetch(apiUrl('/api/auth/sync'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    password: user.password
                })
            });
        } catch (e) { /* ignore */ }
    }

    function getUserSession() {
        return read(KEYS.userSession, null);
    }

    function setUserSession(user) {
        write(KEYS.userSession, { id: user.id, name: user.name, email: user.email });
    }

    function clearUserSession() {
        localStorage.removeItem(KEYS.userSession);
    }

    function getAdminSession() {
        return read(KEYS.adminSession, null);
    }

    function setAdminSession() {
        write(KEYS.adminSession, { role: 'admin', email: ADMIN_EMAIL, loginAt: Date.now() });
    }

    function clearAdminSession() {
        localStorage.removeItem(KEYS.adminSession);
    }

    async function registerUser(name, email, password) {
        const trimmedName = String(name || '').trim();
        const normEmail = normalizeEmail(email);
        const pwd = String(password);

        if (await isBackendAvailable()) {
            try {
                const res = await fetch(apiUrl('/api/auth/register'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: trimmedName, email: normEmail, password: pwd })
                });
                const data = await res.json();
                if (data.ok && data.user) {
                    const full = upsertLocalUser(data.user, pwd);
                    setUserSession(full);
                    return { ok: true, user: full };
                }
                return { ok: false, message: data.message || 'Could not create account.' };
            } catch (e) {
                console.warn('Server register failed, using local storage', e);
            }
        }

        const users = getUsers();
        if (users.some(u => normalizeEmail(u.email) === normEmail)) {
            return { ok: false, message: 'An account with this email already exists.' };
        }
        const user = { id: String(Date.now()), name: trimmedName, email: normEmail, password: pwd };
        users.push(user);
        saveUsers(users);
        setUserSession(user);
        if (await isBackendAvailable()) await syncUserToServer(user);
        return { ok: true, user };
    }

    async function loginUser(email, password) {
        const normEmail = normalizeEmail(email);
        const pwd = String(password);

        if (!normEmail || !pwd) {
            return { ok: false, message: 'Email and password are required.' };
        }
        if (pwd.length < 6) {
            return { ok: false, message: 'Password must be at least 6 characters.' };
        }

        if (await isBackendAvailable()) {
            try {
                const res = await fetch(apiUrl('/api/auth/login'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: normEmail, password: pwd })
                });
                const data = await res.json();
                if (data.ok && data.user) {
                    const full = upsertLocalUser(data.user, pwd);
                    setUserSession(full);
                    return { ok: true, user: full };
                }
                if (res.status === 404 || data.code === 'not_found') {
                    return registerUser(nameFromEmail(normEmail), normEmail, pwd);
                }
                if (res.status === 401) {
                    const local = findLocalUser(normEmail, pwd);
                    if (local) {
                        setUserSession(local);
                        await syncUserToServer(local);
                        return { ok: true, user: local };
                    }
                    return { ok: false, message: 'Invalid email or password.' };
                }
            } catch (e) {
                console.warn('Server login failed, using local storage', e);
            }
        }

        const user = findLocalUser(normEmail, pwd);
        if (user) {
            setUserSession(user);
            if (await isBackendAvailable()) await syncUserToServer(user);
            return { ok: true, user };
        }

        if (userExistsLocally(normEmail)) {
            return { ok: false, message: 'Invalid email or password.' };
        }

        return registerUser(nameFromEmail(normEmail), normEmail, pwd);
    }

    function loginAdmin(email, password) {
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
            setAdminSession();
            return { ok: true };
        }
        return { ok: false, message: 'Invalid admin credentials.' };
    }

    function logoutUser() {
        clearUserSession();
    }

    function logoutAdmin() {
        clearAdminSession();
    }

    function buildSubmissionEntry(type, data) {
        const user = getUserSession();
        const entry = {
            id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
            type,
            data,
            createdAt: new Date().toISOString(),
            read: false,
            userId: user ? user.id : null,
            userName: user ? user.name : (data.reporterName || (data.firstName ? `${data.firstName || ''} ${data.lastName || ''}`.trim() : data.name || 'Guest'))
        };
        if (type === 'adoption') {
            entry.adminStatus = 'pending';
            entry.meetingDate = null;
            entry.meetingTime = null;
            entry.meetingDay = null;
        }
        return entry;
    }

    async function addSubmission(type, data) {
        const entry = buildSubmissionEntry(type, data);

        if (await isBackendAvailable()) {
            try {
                const res = await fetch(apiUrl('/api/submissions'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entry)
                });
                if (res.ok) {
                    await loadSubmissions();
                    return entry;
                }
            } catch (e) {
                console.warn('Server save failed, saving locally', e);
            }
        }

        const list = getSubmissionsLocal();
        list.unshift(entry);
        submissionsCache = list;
        submissionsLoaded = true;
        saveSubmissionsLocal(list);
        notifyUpdated();
        if (await isBackendAvailable()) await syncSubmissionsToServer(list);
        return entry;
    }

    async function markSubmissionRead(id) {
        return updateSubmission(id, { read: true });
    }

    async function updateSubmission(id, patch) {
        const applyPatch = (list) => list.map(s => {
            if (s.id !== id) return s;
            const merged = { ...s, ...patch };
            if (patch.data) merged.data = { ...s.data, ...patch.data };
            return merged;
        });

        if (await isBackendAvailable()) {
            try {
                const res = await fetch(apiUrl('/api/submissions/update'), {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, patch })
                });
                if (res.ok) {
                    await loadSubmissions();
                    return await res.json();
                }
            } catch (e) {
                console.warn('Server update failed, saving locally', e);
            }
        }

        const list = applyPatch(getSubmissions());
        submissionsCache = list;
        submissionsLoaded = true;
        saveSubmissionsLocal(list);
        notifyUpdated();
        if (await isBackendAvailable()) await syncSubmissionsToServer(list);
        return list.find(s => s.id === id);
    }

    function withDefaultPhotos(children) {
        const photos = { '1': PHOTO_EMMA, '2': PHOTO_JAMES, '3': PHOTO_SOPHIA };
        return children.map(c => ({
            ...c,
            image: c.image || photos[c.id] || ''
        }));
    }

    async function loadChildProfiles() {
        if (await isBackendAvailable()) {
            try {
                const res = await fetch(apiUrl('/api/children'));
                if (res.ok) {
                    const children = withDefaultPhotos(await res.json());
                    write(KEYS.children, children);
                    return children;
                }
            } catch (e) {
                console.warn('Server children fetch failed', e);
            }
        }
        return withDefaultPhotos(getChildProfiles());
    }

    function getUnreadCount(type) {
        const list = getSubmissions().filter(s => !s.read);
        return type ? list.filter(s => s.type === type).length : list.length;
    }

    function getByType(type) {
        return getSubmissions().filter(s => s.type === type);
    }

    function getChildProfiles() {
        const stored = read(KEYS.children, null);
        if (stored && stored.length) return withDefaultPhotos(stored);
        const seeded = withDefaultPhotos(defaultChildren.slice());
        write(KEYS.children, seeded);
        return seeded;
    }

    async function saveChildProfiles(children) {
        write(KEYS.children, children);
        if (await isBackendAvailable()) {
            try {
                await fetch(apiUrl('/api/children'), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(children)
                });
            } catch (e) {
                console.warn('Server children save failed', e);
            }
        }
    }

    function resolveChildId(childId, childName) {
        if (childId) return String(childId);
        const name = (childName || '').trim().toLowerCase();
        if (!name) return null;
        const match = getChildProfiles().find(c => c.name.trim().toLowerCase() === name);
        return match ? String(match.id) : null;
    }

    async function setChildAdopted(childId, childName) {
        const id = resolveChildId(childId, childName);
        if (!id) {
            console.warn('Could not find child to mark adopted', childId, childName);
            return false;
        }
        let children = await loadChildProfiles();
        children = children.map(c =>
            String(c.id) === id ? { ...c, status: 'adopted' } : c
        );
        await saveChildProfiles(children);
        try {
            window.dispatchEvent(new CustomEvent('aurora-children-updated'));
        } catch (e) { /* ignore */ }
        return true;
    }

    function initNav() {
        const navMenu = document.getElementById('navMenu');
        if (!navMenu || navMenu.dataset.authInit) return;
        navMenu.dataset.authInit = '1';

        const user = getUserSession();
        const isAdminPage = document.body.classList.contains('admin-page');

        let loginLi = navMenu.querySelector('[data-nav-login]');
        if (!loginLi) {
            loginLi = document.createElement('li');
            loginLi.setAttribute('data-nav-login', '');
            navMenu.appendChild(loginLi);
        }

        if (user && !isAdminPage) {
            loginLi.innerHTML = `<span class="nav-user-name">${user.name.split(' ')[0]}</span> · <a href="logout.html">Logout</a>`;
        } else if (!isAdminPage) {
            loginLi.innerHTML = '<a href="login.html">Login</a>';
        } else {
            loginLi.innerHTML = '';
        }
    }

    function requireUserLogin(redirectPath) {
        if (getUserSession()) return true;
        const dest = redirectPath || window.location.pathname.split('/').pop();
        window.location.href = `login.html?redirect=${encodeURIComponent(dest)}`;
        return false;
    }

    function requireAdminLogin() {
        if (getAdminSession()) return true;
        window.location.href = 'admin-login.html';
        return false;
    }

    function isFileProtocol() {
        return window.location.protocol === 'file:';
    }

    redirectToServerIfNeeded();

    return {
        KEYS,
        ADMIN_EMAIL,
        useServer,
        isBackendAvailable,
        isFileProtocol,
        loadSubmissions,
        getUsers,
        getUserSession,
        getAdminSession,
        registerUser,
        loginUser,
        loginAdmin,
        logoutUser,
        logoutAdmin,
        addSubmission,
        markSubmissionRead,
        updateSubmission,
        getUnreadCount,
        getSubmissions,
        getByType,
        getChildProfiles,
        loadChildProfiles,
        saveChildProfiles,
        setChildAdopted,
        resolveChildId,
        initNav,
        requireUserLogin,
        requireAdminLogin
    };
})();
