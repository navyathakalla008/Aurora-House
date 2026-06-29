(function initAdminDashboard() {
    if (!AuroraData.getAdminSession()) {
        window.location.href = 'admin-login.html';
        return;
    }

let adminPendingImage = '';

function formatDate(iso) {
    return new Date(iso).toLocaleString();
}

function typeLabel(type) {
    const map = { adoption: 'Adoption', donation: 'Donation', rescue: 'Rescue', contact: 'Contact' };
    return map[type] || type;
}

function updateBadges() {
    const all = AuroraData.getUnreadCount();
    document.getElementById('badgeAll').textContent = all || '';
    document.getElementById('badgeAdoption').textContent = AuroraData.getUnreadCount('adoption') || '';
    document.getElementById('badgeDonation').textContent = AuroraData.getUnreadCount('donation') || '';
    document.getElementById('badgeRescue').textContent = AuroraData.getUnreadCount('rescue') || '';
    document.getElementById('badgeContact').textContent = AuroraData.getUnreadCount('contact') || '';
    ['badgeAll', 'badgeAdoption', 'badgeDonation', 'badgeRescue', 'badgeContact'].forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.textContent) el.style.display = 'none';
        else if (el) el.style.display = 'inline';
    });
}

function renderSubmissionItem(s) {
    const title = getSubmissionTitle(s);
    return `
        <div class="notification-item ${s.read ? '' : 'unread'}" data-id="${s.id}" data-type="${s.type}">
            <h4><span class="type-tag type-${s.type}">${typeLabel(s.type)}</span>${title}</h4>
            <p class="notification-meta">${s.userName || 'Guest'} · ${formatDate(s.createdAt)}</p>
        </div>
    `;
}

function getSubmissionTitle(s) {
    const d = s.data;
    if (s.type === 'adoption') {
        const who = `${d.firstName || ''} ${d.lastName || ''}`.trim();
        const child = d.childName ? ` → ${d.childName}` : '';
        return `Adoption inquiry: ${who}${child}`;
    }
    if (s.type === 'donation') return `Donation $${d.amount} — ${d.designationLabel || d.designation || 'General'}`;
    if (s.type === 'rescue') return `Rescue report — age ~${d.approxAge || '?'}`;
    if (s.type === 'contact') return `${d.subject || 'Message'} from ${d.name || 'Unknown'}`;
    return 'New submission';
}

function formatDetail(s) {
    const d = s.data;
    let html = `<h3>${typeLabel(s.type)} Details</h3><p><strong>From:</strong> ${s.userName || 'Guest'}<br><strong>Date:</strong> ${formatDate(s.createdAt)}</p>`;

    if (s.type === 'adoption') {
        html += `
            <div class="admin-detail-grid">
                <p><strong>Child:</strong> ${d.childName || '—'} ${d.childId ? `(ID: ${d.childId})` : ''}</p>
                <p><strong>Applicant:</strong> ${d.firstName || ''} ${d.lastName || ''}</p>
                <p><strong>Email:</strong> ${d.email || '—'}</p>
                <p><strong>Phone:</strong> ${d.phone || '—'}</p>
                <p><strong>Address:</strong> ${d.address || ''}, ${d.city || ''}, ${d.state || ''} ${d.zip || ''}</p>
                <p><strong>Age:</strong> ${d.age || '—'} · <strong>Marital status:</strong> ${d.maritalStatus || '—'}</p>
                <p><strong>Motivation:</strong></p>
                <p>${(d.motivation || '—').replace(/</g, '&lt;')}</p>
                <p><strong>Consent:</strong> ${d.consent ? 'Yes' : 'No'}</p>
            </div>`;
    } else if (s.type === 'donation') {
        html += `<p><strong>Amount:</strong> $${d.amount}</p><p><strong>Type:</strong> ${d.type}</p><p><strong>Designation:</strong> ${d.designationLabel || d.designation}</p><pre>${JSON.stringify(d, null, 2).replace(/</g, '&lt;')}</pre>`;
    } else if (s.type === 'rescue') {
        if (d.childImage) html += `<p><strong>Child photo:</strong></p><img src="${d.childImage}" alt="Child">`;
        html += `<pre>${JSON.stringify({ ...d, childImage: d.childImage ? '[image attached]' : null }, null, 2).replace(/</g, '&lt;')}</pre>`;
    } else {
        html += `<pre>${JSON.stringify(d, null, 2).replace(/</g, '&lt;')}</pre>`;
    }
    return html;
}

function esc(text) {
    return String(text == null ? '' : text).replace(/</g, '&lt;');
}

function adminStatusLabel(status) {
    const map = {
        pending: 'Pending review',
        accepted: 'Accepted — meeting scheduled',
        denied: 'Denied',
        adopted: 'Adopted'
    };
    return map[status] || 'Pending review';
}

function formatMeeting(s) {
    const parts = [];
    if (s.meetingDay) parts.push(s.meetingDay);
    if (s.meetingDate) {
        try {
            parts.push(new Date(s.meetingDate + 'T12:00:00').toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            }));
        } catch {
            parts.push(s.meetingDate);
        }
    }
    if (s.meetingTime) {
        const [h, m] = s.meetingTime.split(':');
        const d = new Date();
        d.setHours(parseInt(h, 10), parseInt(m, 10));
        parts.push(d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }));
    }
    return parts.join(' · ') || '—';
}

function resolveInquiryChildId(s) {
    return AuroraData.resolveChildId(s.data?.childId, s.data?.childName);
}

function renderAdoptionActions(s) {
    const status = s.adminStatus || 'pending';
    const id = s.id;
    const childId = resolveInquiryChildId(s) || '';
    const childName = s.data?.childName || '';

    if (status === 'pending') {
        return `
            <div class="admin-status-bar status-pending">${adminStatusLabel(status)}</div>
            <div class="admin-action-row">
                <button type="button" class="btn btn-primary accept-btn" data-id="${id}">Accept</button>
                <button type="button" class="btn btn-secondary deny-btn" data-id="${id}">Deny</button>
            </div>
            <p class="form-hint">Click <strong>Accept</strong> to set the meeting date, time and day with the family.</p>
        `;
    }
    if (status === 'accepted') {
        return `
            <div class="admin-status-bar status-accepted">${adminStatusLabel(status)}</div>
            <p class="step-label">Step 2 complete — Meeting scheduled</p>
            <p class="meeting-info"><strong>Meet child on:</strong> ${esc(formatMeeting(s))}</p>
            <p class="step-label">Step 3 — After the family meets the child</p>
            <button type="button" class="btn btn-primary btn-large mark-adopted-btn" data-id="${id}" data-child-id="${esc(childId)}" data-child-name="${esc(childName)}">Mark as Adopted</button>
            <p class="form-hint">This updates the public adoption page: <strong>Available</strong> becomes <strong>Adopted</strong> for ${esc(childName)}.</p>
        `;
    }
    if (status === 'denied') {
        return `<div class="admin-status-bar status-denied">${adminStatusLabel(status)}</div><p class="form-hint">This application was declined.</p>`;
    }
    if (status === 'adopted') {
        return `
            <div class="admin-status-bar status-adopted">✓ Adopted — ${esc(childName)} now shows as <strong>Adopted</strong> on the public website</div>
        `;
    }
    return '';
}

function renderAdoptionInquiryCard(s) {
    const d = s.data;
    const name = `${esc(d.firstName)} ${esc(d.lastName)}`.trim();
    const status = s.adminStatus || 'pending';

    return `
        <article class="adoption-inquiry-card ${s.read && status !== 'pending' ? '' : 'unread'}" data-id="${s.id}">
            <div class="adoption-card-top">
                <span class="type-tag type-adoption">Adoption Inquiry</span>
                <span class="adoption-card-date">${formatDate(s.createdAt)}</span>
            </div>
            <h3 class="adoption-card-child">Child: <strong>${esc(d.childName || 'Not specified')}</strong></h3>
            <div class="adoption-applicant-grid">
                <div class="applicant-field">
                    <label>Person adopting</label>
                    <p>${name || '—'}</p>
                </div>
                <div class="applicant-field">
                    <label>Email</label>
                    <p>${esc(d.email) || '—'}</p>
                </div>
                <div class="applicant-field">
                    <label>Phone</label>
                    <p>${esc(d.phone) || '—'}</p>
                </div>
                <div class="applicant-field">
                    <label>Age</label>
                    <p>${esc(d.age) || '—'}</p>
                </div>
                <div class="applicant-field">
                    <label>Marital status</label>
                    <p>${esc(d.maritalStatus) || '—'}</p>
                </div>
                <div class="applicant-field applicant-field-wide">
                    <label>Address</label>
                    <p>${esc(d.address)}, ${esc(d.city)}, ${esc(d.state)} ${esc(d.zip)}</p>
                </div>
                <div class="applicant-field applicant-field-wide">
                    <label>Why they want to adopt</label>
                    <p>${esc(d.motivation) || '—'}</p>
                </div>
            </div>
            <div class="adoption-admin-actions" data-submission-id="${s.id}">
                ${renderAdoptionActions(s)}
            </div>
        </article>
    `;
}

function bindAdoptionsList() {
    const container = document.getElementById('listAdoptions');
    if (!container) return;

    const items = AuroraData.getByType('adoption');

    if (!items.length) {
        container.innerHTML = '<p class="admin-empty">No adoption submissions yet. Submit an inquiry from the adoption page (while the server is running).</p>';
        return;
    }

    container.innerHTML = items.map(renderAdoptionInquiryCard).join('');
}

function openAcceptModal(submissionId) {
    const modal = document.getElementById('acceptScheduleModal');
    const sub = AuroraData.getSubmissions().find(s => s.id === submissionId);
    if (!modal || !sub) return;

    const d = sub.data;
    const applicant = `${d.firstName || ''} ${d.lastName || ''}`.trim();
    document.getElementById('acceptSubmissionId').value = submissionId;
    document.getElementById('acceptModalSubtitle').textContent =
        `Child: ${d.childName || '—'} · Applicant: ${applicant || '—'}`;

    const form = document.getElementById('acceptScheduleForm');
    if (form) form.reset();
    document.getElementById('acceptSubmissionId').value = submissionId;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('acceptMeetingDate')?.focus(), 100);
}

function closeAcceptModal() {
    const modal = document.getElementById('acceptScheduleModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

async function handleAdoptionListClick(e) {
    const acceptBtn = e.target.closest('.accept-btn');
    if (acceptBtn) {
        e.preventDefault();
        e.stopPropagation();
        openAcceptModal(acceptBtn.dataset.id);
        return;
    }

    const denyBtn = e.target.closest('.deny-btn');
    if (denyBtn) {
        e.preventDefault();
        if (!confirm('Deny this adoption application?')) return;
        try {
            await AuroraData.updateSubmission(denyBtn.dataset.id, { adminStatus: 'denied', read: true });
            await refreshAll();
        } catch (err) {
            alert('Could not update. Please try again.');
        }
        return;
    }

    const adoptedBtn = e.target.closest('.mark-adopted-btn');
    if (adoptedBtn) {
        e.preventDefault();
        const childName = adoptedBtn.dataset.childName || 'this child';
        if (!confirm(`Mark ${childName} as Adopted on the public website? Visitors will see "Adopted" instead of "Available".`)) return;
        try {
            const ok = await AuroraData.setChildAdopted(
                adoptedBtn.dataset.childId,
                adoptedBtn.dataset.childName
            );
            if (!ok) {
                alert('Could not find child profile. Check child name matches a profile.');
                return;
            }
            await AuroraData.updateSubmission(adoptedBtn.dataset.id, { adminStatus: 'adopted', read: true });
            await refreshAll();
            alert(`${childName} is now shown as Adopted on the adoption page.`);
        } catch (err) {
            alert('Could not mark adopted. Please try again.');
        }
    }
}

function bindList(containerId, detailId, type) {
    const container = document.getElementById(containerId);
    const detail = document.getElementById(detailId);
    if (!container) return;

    const items = type ? AuroraData.getByType(type) : AuroraData.getSubmissions().slice(0, 20);

    if (!items.length) {
        container.innerHTML = '<p class="admin-empty">No submissions yet.</p>';
        return;
    }

    container.innerHTML = items.map(renderSubmissionItem).join('');

    container.querySelectorAll('.notification-item').forEach(el => {
        el.addEventListener('click', async () => {
            const sub = AuroraData.getSubmissions().find(x => x.id === el.dataset.id);
            if (!sub) return;
            await AuroraData.markSubmissionRead(sub.id);
            detail.innerHTML = formatDetail(sub);
            detail.classList.add('open');
            updateBadges();
            el.classList.remove('unread');
            if (type === 'adoption') bindAdoptionsList();
        });
    });
}

function renderOverview() {
    const stats = document.getElementById('overviewStats');
    stats.innerHTML = `
        <div class="stat-box"><strong>${AuroraData.getByType('adoption').length}</strong><span>Adoption inquiries</span></div>
        <div class="stat-box"><strong>${AuroraData.getByType('donation').length}</strong><span>Donations</span></div>
        <div class="stat-box"><strong>${AuroraData.getByType('rescue').length}</strong><span>Rescue reports</span></div>
        <div class="stat-box"><strong>${AuroraData.getByType('contact').length}</strong><span>Contacts</span></div>
        <div class="stat-box"><strong>${AuroraData.getUnreadCount()}</strong><span>Unread alerts</span></div>
    `;

    const list = document.getElementById('overviewNotifications');
    const recent = AuroraData.getSubmissions().slice(0, 15);
    if (!recent.length) {
        list.innerHTML = '<p class="admin-empty">No activity yet. Submissions from the website will appear here.</p>';
        return;
    }
    list.innerHTML = recent.map(renderSubmissionItem).join('');
    const detail = document.getElementById('overviewDetail');
    list.querySelectorAll('.notification-item').forEach(el => {
        el.addEventListener('click', () => {
            const sub = AuroraData.getSubmissions().find(x => x.id === el.dataset.id);
            if (!sub) return;
            AuroraData.markSubmissionRead(sub.id);
            detail.innerHTML = formatDetail(sub);
            detail.classList.add('open');
            updateBadges();
            el.classList.remove('unread');
        });
    });
}

document.querySelectorAll('#adminNav a[data-panel]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const panel = link.dataset.panel;
        document.querySelectorAll('#adminNav a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('panel-' + panel).classList.add('active');
        const titles = {
            overview: 'Dashboard Overview',
            adoptions: 'Adoption Inquiries',
            donations: 'Donations & In-Kind',
            rescues: 'Rescue Reports',
            contacts: 'Contact Messages',
            children: 'Child Profiles'
        };
        document.getElementById('panelTitle').textContent = titles[panel] || 'Admin';
        refreshAll();
    });
});

document.getElementById('refreshAdoptionsBtn')?.addEventListener('click', () => refreshAll());

document.getElementById('adminLogout').addEventListener('click', () => {
    AuroraData.logoutAdmin();
    window.location.href = 'admin-login.html';
});

function readAdminImage(file, cb) {
    if (!file || !file.type.startsWith('image/')) { cb(''); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image max 5 MB'); cb(''); return; }
    const r = new FileReader();
    r.onload = () => cb(r.result);
    r.readAsDataURL(file);
}

function renderAdminChildren() {
    const list = document.getElementById('adminChildrenList');
    if (!list) return;
    const children = AuroraData.getChildProfiles();
    list.innerHTML = children.map(c => `
        <div class="admin-child-mini">
            ${c.image ? `<img src="${c.image}" alt="${c.name}" class="admin-child-thumb">` : ''}
            <strong>${c.name}, ${c.age}</strong> — ${c.status === 'adopted' ? 'Adopted' : 'Available'}
            <p style="font-size:0.85rem;color:#666;margin:0.5rem 0">${c.description.slice(0, 80)}...</p>
            <button type="button" class="btn btn-secondary edit-admin-child" data-id="${c.id}">Edit</button>
            <button type="button" class="btn btn-secondary delete-admin-child" data-id="${c.id}" style="margin-left:0.25rem">Delete</button>
        </div>
    `).join('');

    list.querySelectorAll('.edit-admin-child').forEach(btn => {
        btn.addEventListener('click', () => {
            const c = AuroraData.getChildProfiles().find(x => x.id === btn.dataset.id);
            if (!c) return;
            document.getElementById('adminChildFormTitle').textContent = 'Edit Child Profile';
            document.getElementById('adminChildId').value = c.id;
            document.getElementById('adminChildName').value = c.name;
            document.getElementById('adminChildAge').value = c.age;
            document.getElementById('adminChildGender').value = c.gender || 'Female';
            document.getElementById('adminChildStatus').value = c.status || 'available';
            document.getElementById('adminChildDesc').value = c.description;
            adminPendingImage = c.image || '';
            const prev = document.getElementById('adminChildPhotoPreview');
            prev.innerHTML = c.image ? `<img src="${c.image}" alt="">` : '';
        });
    });

    list.querySelectorAll('.delete-admin-child').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Delete this child profile?')) return;
            const filtered = AuroraData.getChildProfiles().filter(x => x.id !== btn.dataset.id);
            await AuroraData.saveChildProfiles(filtered);
            renderAdminChildren();
        });
    });
}

const adminChildPhotoEl = document.getElementById('adminChildPhoto');
if (adminChildPhotoEl) {
    adminChildPhotoEl.addEventListener('change', (e) => {
        readAdminImage(e.target.files[0], (url) => {
            adminPendingImage = url;
            const prev = document.getElementById('adminChildPhotoPreview');
            if (prev) prev.innerHTML = url ? `<img src="${url}" alt="">` : '';
        });
    });
}

const adminChildCancelEl = document.getElementById('adminChildCancel');
if (adminChildCancelEl) {
    adminChildCancelEl.addEventListener('click', () => {
        document.getElementById('adminChildForm')?.reset();
        const idEl = document.getElementById('adminChildId');
        if (idEl) idEl.value = '';
        const titleEl = document.getElementById('adminChildFormTitle');
        if (titleEl) titleEl.textContent = 'Add Child Profile';
        const prev = document.getElementById('adminChildPhotoPreview');
        if (prev) prev.innerHTML = '';
        adminPendingImage = '';
    });
}

const adminChildFormEl = document.getElementById('adminChildForm');
if (adminChildFormEl) {
adminChildFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('adminChildId').value;
    const payload = {
        name: document.getElementById('adminChildName').value.trim(),
        age: parseInt(document.getElementById('adminChildAge').value, 10),
        gender: document.getElementById('adminChildGender').value,
        status: document.getElementById('adminChildStatus').value,
        description: document.getElementById('adminChildDesc').value.trim(),
        image: adminPendingImage
    };
    let children = AuroraData.getChildProfiles();
    if (id) {
        children = children.map(c => c.id === id ? { ...c, ...payload, image: payload.image || c.image } : c);
    } else {
        children.push({
            id: String(Date.now()),
            ...payload,
            availableSince: String(new Date().getFullYear()),
            needs: 'Loving Home',
            personality: payload.description,
            interests: [],
            healthStatus: 'Good',
            healthReports: [],
            videos: []
        });
    }
    await AuroraData.saveChildProfiles(children);
    adminChildCancelEl?.click();
    renderAdminChildren();
});
}

const listAdoptionsEl = document.getElementById('listAdoptions');
if (listAdoptionsEl) {
    listAdoptionsEl.addEventListener('click', handleAdoptionListClick);
}

const acceptScheduleModal = document.getElementById('acceptScheduleModal');
const acceptScheduleForm = document.getElementById('acceptScheduleForm');

if (document.getElementById('closeAcceptModal')) {
    document.getElementById('closeAcceptModal').addEventListener('click', closeAcceptModal);
}
if (document.getElementById('cancelAcceptModal')) {
    document.getElementById('cancelAcceptModal').addEventListener('click', closeAcceptModal);
}
if (acceptScheduleModal) {
    acceptScheduleModal.addEventListener('click', (e) => {
        if (e.target === acceptScheduleModal) closeAcceptModal();
    });
}

if (acceptScheduleForm) {
    acceptScheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('acceptSubmissionId').value;
        const meetingDate = document.getElementById('acceptMeetingDate').value;
        const meetingTime = document.getElementById('acceptMeetingTime').value;
        const meetingDay = document.getElementById('acceptMeetingDay').value.trim();

        if (!meetingDate || !meetingTime || !meetingDay) {
            alert('Please enter meeting date, time, and day.');
            return;
        }

        try {
            await AuroraData.updateSubmission(id, {
                adminStatus: 'accepted',
                meetingDate,
                meetingTime,
                meetingDay,
                read: true
            });
            closeAcceptModal();
            await refreshAll();
            alert('Application accepted and meeting scheduled. After the visit, click "Mark as Adopted".');
        } catch (err) {
            alert('Could not save. Please try again.');
        }
    });
}

async function refreshAll() {
    await AuroraData.loadSubmissions();
    await AuroraData.loadChildProfiles();
    updateBadges();
    renderOverview();
    bindAdoptionsList();
    bindList('listDonations', 'detailDonations', 'donation');
    bindList('listRescues', 'detailRescues', 'rescue');
    bindList('listContacts', 'detailContacts', 'contact');
    renderAdminChildren();
}

async function showServerWarning() {
    const el = document.getElementById('serverWarning');
    if (!el) return;
    const ok = await AuroraData.isBackendAvailable();
    el.style.display = ok ? 'none' : 'block';
}

showServerWarning();
refreshAll();

window.addEventListener('aurora-submissions-updated', () => refreshAll());
window.addEventListener('storage', (e) => {
    if (e.key === AuroraData.KEYS.submissions || e.key === null) refreshAll();
});
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshAll();
});

})();
