// ============================================
// Aurora House - Interactive JavaScript
// ============================================

// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Animated Counter for Stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Intersection Observer for Stats Animation
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber && !statNumber.dataset.animated) {
                const target = parseInt(statNumber.dataset.target || statNumber.textContent.replace(/[^0-9]/g, ''));
                if (!isNaN(target)) {
                    statNumber.dataset.animated = 'true';
                    animateCounter(statNumber, target);
                }
            }
        }
    });
}, observerOptions);

// Observe all stat cards
document.querySelectorAll('.stat-card').forEach(card => {
    observer.observe(card);
});

// Donation Form Handling
const donationForm = document.getElementById('donationForm');
if (donationForm) {
    // Amount button selection
    const amountButtons = document.querySelectorAll('.amount-btn');
    const amountInput = document.getElementById('donationAmount');

    amountButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            amountButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            amountInput.value = btn.dataset.amount;
        });
    });

    // Custom amount input
    if (amountInput) {
        amountInput.addEventListener('input', () => {
            amountButtons.forEach(b => b.classList.remove('active'));
        });
    }

    // Form submission
    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(donationForm);
        const donationData = {
            amount: formData.get('amount'),
            type: formData.get('type'),
            designation: formData.get('designation'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            zip: formData.get('zip'),
            anonymous: formData.get('anonymous') === 'on',
            newsletter: formData.get('newsletter') === 'on',
            taxReceipt: formData.get('taxReceipt') === 'on'
        };

        // Validate amount
        if (!donationData.amount || parseFloat(donationData.amount) <= 0) {
            alert('Please enter a valid donation amount.');
            return;
        }

        const designationLabels = {
            general: 'General Fund',
            education: 'Education Program',
            healthcare: 'Healthcare Services',
            food: 'Food & Nutrition',
            clothes: 'Clothing & Essentials',
            activities: 'Activities & Recreation',
            emergency: 'Emergency Fund'
        };
        donationData.designationLabel = designationLabels[donationData.designation] || donationData.designation;

        if (typeof AuroraData !== 'undefined') {
            AuroraData.addSubmission('donation', donationData).catch(() => {});
        }
        console.log('Donation Data:', donationData);
        
        // Show success message
        donationForm.style.display = 'none';
        const successDiv = document.getElementById('donationSuccess');
        const successAmount = document.getElementById('successAmount');
        
        if (successDiv && successAmount) {
            successDiv.style.display = 'block';
            successAmount.textContent = parseFloat(donationData.amount).toFixed(2);
        }

        // In a real application, you would:
        // 1. Send data to payment processor (Stripe, PayPal, etc.)
        // 2. Handle payment processing
        // 3. Send confirmation email
        // 4. Update database
        
        // Reset form after 5 seconds (for demo purposes)
        setTimeout(() => {
            donationForm.reset();
            donationForm.style.display = 'block';
            if (successDiv) successDiv.style.display = 'none';
            amountButtons.forEach(b => b.classList.remove('active'));
        }, 5000);
    });
}

// Contact Form Handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            newsletter: formData.get('newsletter') === 'on'
        };

        // Validate required fields
        if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
            alert('Please fill in all required fields.');
            return;
        }

        if (typeof AuroraData !== 'undefined') {
            AuroraData.addSubmission('contact', contactData).catch(() => {});
        }
        console.log('Contact Data:', contactData);
        
        // Show success message
        contactForm.style.display = 'none';
        const successDiv = document.getElementById('contactSuccess');
        
        if (successDiv) {
            successDiv.style.display = 'block';
        }

        // In a real application, you would:
        // 1. Send email notification
        // 2. Store in database
        // 3. Send auto-reply to user
        
        // Reset form after 5 seconds (for demo purposes)
        setTimeout(() => {
            contactForm.reset();
            contactForm.style.display = 'block';
            if (successDiv) successDiv.style.display = 'none';
        }, 5000);
    });
}

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active', !isActive);
        });
    }
});

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Scroll to Top Button (optional enhancement)
let scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '↑';
scrollTopBtn.className = 'scroll-top-btn';
scrollTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    display: none;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
`;
document.body.appendChild(scrollTopBtn);

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.style.display = 'block';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

// Form Input Validation
const inputs = document.querySelectorAll('input, textarea, select');
inputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.hasAttribute('required') && !this.value.trim()) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '';
        }
    });

    input.addEventListener('input', function() {
        if (this.style.borderColor === 'rgb(231, 76, 60)') {
            this.style.borderColor = '';
        }
    });
});

// Email Validation
const emailInputs = document.querySelectorAll('input[type="email"]');
emailInputs.forEach(input => {
    input.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
            this.style.borderColor = '#e74c3c';
            alert('Please enter a valid email address.');
        } else if (this.value) {
            this.style.borderColor = '#27ae60';
        }
    });
});

// Phone Number Formatting (optional)
const phoneInputs = document.querySelectorAll('input[type="tel"]');
phoneInputs.forEach(input => {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 3) {
                value = `(${value}`;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
            e.target.value = value;
        }
    });
});

// Add loading state to buttons on form submission
const submitButtons = document.querySelectorAll('button[type="submit"]');
submitButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const form = this.closest('form');
        if (form && form.checkValidity()) {
            this.style.opacity = '0.7';
            this.style.cursor = 'not-allowed';
            this.disabled = true;
            
            // Re-enable after 3 seconds (for demo)
            setTimeout(() => {
                this.style.opacity = '1';
                this.style.cursor = 'pointer';
                this.disabled = false;
            }, 3000);
        }
    });
});

// ============================================
// Adoption – Child Profiles (localStorage CRUD)
// ============================================

const defaultChildProfiles = [
    {
        id: '1',
        name: 'Emma',
        age: 5,
        gender: 'Female',
        status: 'available',
        image: '',
        availableSince: '2023',
        description: 'Sweet and energetic, loves art and outdoor activities. Looking for a loving family.',
        needs: 'Loving Home',
        personality: 'Emma is a bright and cheerful child who loves to express herself through art. She enjoys drawing, painting, and creating crafts. She is also very active and loves playing outside, especially on the playground. Emma is social and gets along well with other children.',
        interests: ['Art', 'Outdoor Activities', 'Music', 'Reading'],
        healthStatus: 'Good',
        healthReports: [
            { type: 'General Health', date: '2024-01-15', status: 'Excellent', details: ['All vaccinations up to date', 'Regular checkups completed', 'No chronic conditions', 'Normal development'] },
            { type: 'Mental Health', date: '2024-01-10', status: 'Good', details: ['Counseling sessions ongoing', 'Positive progress', 'Well-adjusted', 'Good social skills'] }
        ],
        videos: [{ title: "Emma's Daily Activities", description: 'A day in the life of Emma at Aurora House', url: 'https://www.youtube.com/embed/placeholder1' }]
    },
    {
        id: '2',
        name: 'James',
        age: 8,
        gender: 'Male',
        status: 'available',
        image: '',
        availableSince: '2022',
        description: 'Bright and curious, enjoys reading and science. Ready for a forever family.',
        needs: 'Supportive Family',
        personality: 'James is an intelligent and curious child with a passion for learning. He loves reading books, especially about science and nature.',
        interests: ['Reading', 'Science', 'Mathematics', 'Nature'],
        healthStatus: 'Good',
        healthReports: [
            { type: 'General Health', date: '2024-01-20', status: 'Excellent', details: ['All vaccinations current', 'Regular medical checkups', 'Healthy growth', 'Active lifestyle'] }
        ],
        videos: [{ title: 'James Reading', description: 'James reading his favorite book', url: 'https://www.youtube.com/embed/placeholder3' }]
    },
    {
        id: '3',
        name: 'Sophia',
        age: 6,
        gender: 'Female',
        status: 'available',
        image: '',
        availableSince: '2023',
        description: 'Creative and musical, loves singing and dancing. Seeking a nurturing home.',
        needs: 'Creative Environment',
        personality: 'Sophia is a creative and expressive child who loves music and dance. She has a natural talent for singing and enjoys performing.',
        interests: ['Music', 'Dancing', 'Singing', 'Storytelling'],
        healthStatus: 'Good',
        healthReports: [
            { type: 'General Health', date: '2024-01-18', status: 'Excellent', details: ['All vaccinations up to date', 'Regular checkups', 'Healthy and active', 'Good nutrition'] }
        ],
        videos: [{ title: "Sophia's Performance", description: 'Sophia singing and dancing', url: 'https://www.youtube.com/embed/placeholder4' }]
    }
];

function getChildProfiles() {
    if (typeof AuroraData !== 'undefined') {
        return AuroraData.getChildProfiles();
    }
    return JSON.parse(JSON.stringify(defaultChildProfiles));
}

function getChildById(id) {
    return getChildProfiles().find(c => c.id === id);
}

function childEmoji(gender) {
    if (gender === 'Male') return '👦';
    if (gender === 'Female') return '👧';
    return '👶';
}

function childImageHtml(child) {
    if (child.image) {
        return `<img src="${child.image}" alt="${child.name}" class="child-photo">`;
    }
    return `<div class="image-placeholder-child">${childEmoji(child.gender)}</div>`;
}

function renderChildrenGrid() {
    const grid = document.getElementById('childrenGrid');
    const emptyMsg = document.getElementById('childrenEmpty');
    if (!grid) return;

    const children = getChildProfiles();

    if (children.length === 0) {
        grid.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    grid.innerHTML = children.map(child => {
        const isAdopted = child.status === 'adopted';
        const adoptedStrip = isAdopted
            ? `<div class="adopted-indicator" title="Adopted">
                    <span class="adopted-check">✓</span>
                    <span class="adopted-label">Adopted</span>
               </div>`
            : '';
        const badgeClass = isAdopted ? 'child-badge adopted-badge' : 'child-badge';
        const badgeText = isAdopted ? 'Adopted' : 'Available';
        const cardClass = isAdopted ? 'child-card adopted' : 'child-card';

        return `
            <div class="${cardClass}" data-child-id="${child.id}">
                ${adoptedStrip}
                <div class="child-card-inner">
                    <div class="child-image">
                        ${childImageHtml(child)}
                        <div class="${badgeClass}">${badgeText}</div>
                    </div>
                    <div class="child-info">
                        <h3>${child.name}, Age ${child.age}</h3>
                        <p class="child-description">${child.description}</p>
                        <div class="child-details">
                            <span class="detail-tag">📅 ${isAdopted ? 'Adopted' : 'Available since'}: ${child.availableSince || '—'}</span>
                            ${child.needs ? `<span class="detail-tag">❤️ Needs: ${child.needs}</span>` : ''}
                        </div>
                        <button type="button" class="btn btn-primary view-profile-btn" data-child-id="${child.id}">View Full Profile</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function readImageFile(file, maxBytes, callback) {
    if (!file || !file.type.startsWith('image/')) {
        callback('');
        return;
    }
    if (file.size > maxBytes) {
        alert('Image is too large. Please use a file under 5 MB.');
        callback('');
        return;
    }
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.onerror = () => callback('');
    reader.readAsDataURL(file);
}

function setupImagePreview(input, previewEl, onData) {
    if (!input || !previewEl) return;
    input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) {
            previewEl.innerHTML = '';
            if (onData) onData('');
            return;
        }
        readImageFile(file, 5 * 1024 * 1024, (dataUrl) => {
            if (onData) onData(dataUrl);
            previewEl.innerHTML = dataUrl
                ? `<img src="${dataUrl}" alt="Preview">`
                : '';
        });
    });
}

async function refreshChildrenGrid() {
    if (typeof AuroraData !== 'undefined') {
        await AuroraData.loadChildProfiles();
    }
    renderChildrenGrid();
}

const childrenGridEl = document.getElementById('childrenGrid');
if (childrenGridEl) {
    childrenGridEl.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-profile-btn');
        if (viewBtn) {
            const child = getChildById(viewBtn.dataset.childId);
            if (child) {
                displayChildProfile(child);
                const childModal = document.getElementById('childModal');
                if (childModal) {
                    childModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
            }
        }
    });
    refreshChildrenGrid();
    window.addEventListener('aurora-children-updated', refreshChildrenGrid);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') refreshChildrenGrid();
    });
}

const childModal = document.getElementById('childModal');
const modalBody = document.getElementById('modalBody');

function closeViewModal() {
    if (childModal) childModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

if (childModal) {
    const closeBtn = childModal.querySelector('.close-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeViewModal);
    childModal.addEventListener('click', (e) => {
        if (e.target === childModal) closeViewModal();
    });
}

function displayChildProfile(child) {
    if (!modalBody) return;

    const isAdopted = child.status === 'adopted';
    const statusBanner = isAdopted
        ? `<div class="modal-adopted-banner"><span class="adopted-check">✓</span> Adopted</div>`
        : '';

    const healthReports = child.healthReports || [];
    const videos = child.videos || [];
    const interests = child.interests || [];

    const healthReportsHTML = healthReports.length
        ? healthReports.map(report => `
            <div class="health-report-card">
                <h4>${report.type} - ${report.date}</h4>
                <p><strong>Status:</strong> ${report.status}</p>
                <ul>
                    ${report.details.map(detail => `<li>${detail}</li>`).join('')}
                </ul>
            </div>
        `).join('')
        : '<p>Summary reports are available to approved adoptive families through Aurora House.</p>';

    const videosHTML = videos.length
        ? videos.map(video => `
            <div class="video-container">
                <div class="video-placeholder">
                    <div class="video-placeholder-icon">🎥</div>
                    <p>${video.title}</p>
                    <p style="font-size: 0.9rem; opacity: 0.8;">${video.description}</p>
                    <p style="font-size: 0.8rem; margin-top: 1rem; opacity: 0.6;">(Video will be displayed here - upload video before adoption date)</p>
                </div>
            </div>
        `).join('')
        : '<p>Videos are shared with matched families during the adoption process.</p>';

    const aboutText = child.personality || child.description;
    const adoptCta = isAdopted
        ? `<p class="modal-adopted-note">This child has been adopted. Thank you for your interest.</p>`
        : `<button type="button" class="btn btn-primary btn-large start-adoption-btn" data-child-id="${child.id}" data-child-name="${child.name}">
                Start Adoption Process for ${child.name}
           </button>`;

    modalBody.innerHTML = `
        ${statusBanner}
        <div class="child-profile-header">
            <div class="child-profile-image">
                ${child.image
                    ? `<img src="${child.image}" alt="${child.name}" class="child-photo">`
                    : `<div class="image-placeholder-child">${childEmoji(child.gender)}</div>`}
            </div>
            <div class="child-profile-basic">
                <h2>${child.name}, Age ${child.age}</h2>
                <div class="profile-info-grid">
                    <div class="profile-info-item">
                        <strong>Status</strong>
                        ${isAdopted ? 'Adopted' : 'Available'}
                    </div>
                    <div class="profile-info-item">
                        <strong>Gender</strong>
                        ${child.gender}
                    </div>
                    <div class="profile-info-item">
                        <strong>Available Since</strong>
                        ${child.availableSince}
                    </div>
                    <div class="profile-info-item">
                        <strong>Health Status</strong>
                        ${child.healthStatus || 'Good'}
                    </div>
                    <div class="profile-info-item">
                        <strong>Needs</strong>
                        ${child.needs || 'Loving Home'}
                    </div>
                </div>
            </div>
        </div>

        <div class="profile-section">
            <h3>About ${child.name}</h3>
            <p>${aboutText}</p>
        </div>

        <div class="profile-section">
            <h3>Interests & Hobbies</h3>
            <p>${interests.length ? interests.join(', ') : 'To be updated during intake.'}</p>
        </div>

        <div class="profile-section">
            <h3>Health Reports</h3>
            <p>Complete health reports are available below. All reports are current and updated regularly.</p>
            <div class="health-reports">
                ${healthReportsHTML}
            </div>
        </div>

        <div class="profile-section">
            <h3>Videos</h3>
            <p>Watch videos of ${child.name} to see their personality, activities, and daily life at Aurora House.</p>
            <div class="child-videos">
                ${videosHTML}
            </div>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-light);">
                <strong>Note:</strong> All videos and health reports are available before the adoption date.
                Additional videos and updated reports can be provided upon request during the adoption process.
            </p>
        </div>

        <div style="text-align: center; margin-top: 2rem;">
            ${adoptCta}
        </div>
    `;

    const startBtn = modalBody.querySelector('.start-adoption-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            openAdoptionInquiryModal(child.id, child.name);
        });
    }
}

// Adoption inquiry modal (user details only)
const adoptionInquiryModal = document.getElementById('adoptionInquiryModal');
const adoptionInquiryForm = document.getElementById('adoptionInquiryForm');
const adoptionInquirySuccess = document.getElementById('adoptionInquirySuccess');

function openAdoptionInquiryModal(childId, childName) {
    if (!adoptionInquiryModal) return;

    if (typeof AuroraData !== 'undefined' && !AuroraData.getUserSession()) {
        window.location.href = `login.html?redirect=adoption.html&child=${childId}`;
        return;
    }

    if (childModal) {
        childModal.style.display = 'none';
    }

    document.getElementById('inquiryChildId').value = childId;
    document.getElementById('inquiryChildName').value = childName;
    document.getElementById('inquiryChildDisplay').value = `${childName}`;
    document.getElementById('adoptionInquiryTitle').textContent = `Adoption Inquiry for ${childName}`;

    const user = typeof AuroraData !== 'undefined' ? AuroraData.getUserSession() : null;
    if (user) {
        const parts = user.name.trim().split(/\s+/);
        document.getElementById('inquiryFirstName').value = parts[0] || '';
        document.getElementById('inquiryLastName').value = parts.slice(1).join(' ') || '';
        document.getElementById('inquiryEmail').value = user.email || '';
    }

    if (adoptionInquiryForm) adoptionInquiryForm.style.display = 'block';
    if (adoptionInquirySuccess) adoptionInquirySuccess.style.display = 'none';
    const loginNote = document.getElementById('adoptionInquiryLogin');
    if (loginNote) loginNote.style.display = user ? 'none' : 'block';

    adoptionInquiryModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeAdoptionInquiryModal() {
    if (adoptionInquiryModal) adoptionInquiryModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

if (document.getElementById('closeAdoptionInquiry')) {
    document.getElementById('closeAdoptionInquiry').addEventListener('click', closeAdoptionInquiryModal);
}

if (adoptionInquiryModal) {
    adoptionInquiryModal.addEventListener('click', (e) => {
        if (e.target === adoptionInquiryModal) closeAdoptionInquiryModal();
    });
}

if (adoptionInquiryForm) {
    adoptionInquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (typeof AuroraData !== 'undefined' && !AuroraData.getUserSession()) {
            window.location.href = 'login.html?redirect=adoption.html';
            return;
        }

        const formData = new FormData(adoptionInquiryForm);
        const adoptionData = {
            childId: formData.get('childId'),
            childName: formData.get('childName'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            zip: formData.get('zip'),
            age: formData.get('age'),
            maritalStatus: formData.get('maritalStatus'),
            motivation: formData.get('motivation'),
            consent: formData.get('consent') === 'on'
        };

        if (typeof AuroraData === 'undefined') {
            alert('Unable to save inquiry. Please reload the page and try again.');
            return;
        }

        try {
            await AuroraData.addSubmission('adoption', adoptionData);
            if (!(await AuroraData.isBackendAvailable())) {
                alert('Inquiry saved on this device only. Run start-server.bat and open http://localhost:3000 so admin can see it.');
            }
        } catch (err) {
            alert('Could not save your inquiry. Please try again.');
            return;
        }

        adoptionInquiryForm.style.display = 'none';
        if (adoptionInquirySuccess) adoptionInquirySuccess.style.display = 'block';

        setTimeout(() => {
            adoptionInquiryForm.reset();
            adoptionInquiryForm.style.display = 'block';
            if (adoptionInquirySuccess) adoptionInquirySuccess.style.display = 'none';
            closeAdoptionInquiryModal();
        }, 4000);
    });
}

// Open inquiry after login if ?child= in URL
(function handleAdoptionRedirect() {
    const params = new URLSearchParams(window.location.search);
    const childId = params.get('child');
    if (!childId || !adoptionInquiryModal) return;
    const child = getChildById(childId);
    if (child && typeof AuroraData !== 'undefined' && AuroraData.getUserSession()) {
        setTimeout(() => openAdoptionInquiryModal(child.id, child.name), 400);
    }
})();

function updateAdoptionLoginUI() {
    /* legacy hidden form — inquiry uses modal */
}

// Rescue Form Handling
const rescueForm = document.getElementById('rescueForm');
let rescueChildImageData = '';

if (rescueForm) {
    const policeReportSelect = document.getElementById('policeReport');
    const policeDetails = document.getElementById('policeDetails');
    const rescueSuccess = document.getElementById('rescueSuccess');
    const rescueCaseNumber = document.getElementById('rescueCaseNumber');
    const rescueImageInput = document.getElementById('rescueChildImage');
    const rescueImagePreview = document.getElementById('rescueImagePreview');

    setupImagePreview(rescueImageInput, rescueImagePreview, (dataUrl) => {
        rescueChildImageData = dataUrl;
    });

    if (policeReportSelect && policeDetails) {
        policeReportSelect.addEventListener('change', function() {
            if (this.value === 'yes') {
                policeDetails.style.display = 'block';
            } else {
                policeDetails.style.display = 'none';
            }
        });
    }

    rescueForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const physicalDesc = document.getElementById('physicalDescription').value.trim();
        if (!rescueChildImageData && !physicalDesc) {
            alert('Please upload a photo of the child OR fill in the Physical Description under Child Description.');
            return;
        }

        const formData = new FormData(rescueForm);
        const rescueData = Object.fromEntries(formData.entries());
        rescueData.followUp = formData.get('followUp') === 'on';
        rescueData.rescueConsent = formData.get('rescueConsent') === 'on';
        rescueData.childImage = rescueChildImageData || null;
        rescueData.physicalDescription = physicalDesc;
        delete rescueData.rescueChildImage;

        const caseNumber = `AR-${Date.now().toString().slice(-6)}`;
        rescueData.caseNumber = caseNumber;

        if (typeof AuroraData !== 'undefined') {
            AuroraData.addSubmission('rescue', rescueData).catch(() => {});
        }

        console.log('Rescue Report Data:', {
            ...rescueData,
            childImage: rescueData.childImage ? '[image attached]' : null
        });

        rescueForm.style.display = 'none';
        if (rescueSuccess) {
            rescueSuccess.style.display = 'block';
            if (rescueCaseNumber) {
                rescueCaseNumber.textContent = caseNumber;
            }
        }

        setTimeout(() => {
            rescueForm.reset();
            rescueForm.style.display = 'block';
            if (rescueSuccess) rescueSuccess.style.display = 'none';
            if (policeDetails) policeDetails.style.display = 'none';
            if (rescueImagePreview) rescueImagePreview.innerHTML = '';
            rescueChildImageData = '';
        }, 6000);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof AuroraData !== 'undefined') {
        AuroraData.initNav();
        AuroraData.loadSubmissions().catch(() => {});
    }
    updateAdoptionLoginUI();
    
    // Add fade-in animation to elements on scroll
    const fadeElements = document.querySelectorAll('.mission-card, .program-card, .value-card, .team-member, .child-card, .testimonial-card, .event-card, .story-card, .highlight-card, .process-card, .checklist-card');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeObserver.observe(element);
    });
});


