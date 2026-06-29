# Aurora House - Orphanage Website

A beautiful, modern, and fully responsive website for Aurora House, an orphanage dedicated to providing love, care, and opportunities for children in need.

## 🌟 About Aurora House

Aurora House is a nonprofit organization committed to illuminating lives and creating bright futures for orphaned and vulnerable children. Named after the aurora - the beautiful natural light that illuminates the sky - we believe every child deserves to shine brightly, regardless of their circumstances.

## ✨ Features

### 🏠 Complete Website Structure
- **Homepage** - Beautiful hero section, mission overview, impact statistics, and program previews
- **About Us** - Our story, core values, team members, and achievements timeline
- **Programs** - Detailed information about all our programs:
  - Education Support
  - Healthcare Services
  - Creative Arts
  - Sports & Recreation
  - Life Skills & Career Development
  - Counseling & Support Services
- **Adoption** - Comprehensive adoption process with child profiles, health reports, and videos
- **Rescue & Intake** - Aurora Rescue Network for reporting children in need with detailed intake form and response workflow
- **Donate** - Comprehensive donation form with:
  - Multiple donation amount options
  - Recurring donation options
  - Designation options
  - Secure form handling
  - Impact information
- **Contact** - Contact form, location information, FAQ section, and social media links

### 🎨 Modern Design Features
- Fully responsive design (mobile, tablet, desktop)
- Beautiful gradient backgrounds
- Smooth animations and transitions
- Interactive elements
- Modern color scheme
- Professional typography
- Accessible design

### 💻 Technical Features
- Pure HTML, CSS, and JavaScript (no frameworks required)
- Mobile-friendly navigation with hamburger menu
- Animated statistics counters
- Form validation
- FAQ accordion functionality
- Smooth scrolling
- Scroll-to-top button
- Intersection Observer for scroll animations

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, for development)

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd orphange
   ```

2. **Open the website**
   - **Option 1**: Simply open `index.html` in your web browser
   - **Option 2**: Use a local web server for better development experience:
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js (with http-server)
     npx http-server
     
     # Using PHP
     php -S localhost:8000
     ```
   - Then navigate to `http://localhost:8000` in your browser

## 📁 File Structure

```
orphange/
│
├── index.html          # Homepage
├── about.html          # About Us page
├── programs.html       # Programs page
├── adoption.html       # Adoption page with child profiles
├── rescue.html         # Rescue & intake reporting page
├── donate.html         # Donation page
├── contact.html        # Contact page
├── styles.css          # Main stylesheet
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 🎯 Key Pages Overview

### Homepage (`index.html`)
- Hero section with call-to-action
- Mission statement with 4 core pillars
- Impact statistics (animated counters)
- Program previews
- Gallery, testimonials, success stories, and events
- Call-to-action section

### About Us (`about.html`)
- Our story and history
- Core values (6 values)
- Team members showcase
- Achievements timeline (25 years of milestones)

### Programs (`programs.html`)
- Detailed information about 6 major programs
- Program success metrics
- Impact statistics

### Adoption (`adoption.html`)
- Comprehensive adoption process timeline
- Child profiles with health reports and video placeholders
- Adoption inquiry form with verification steps
- Post-adoption support resources

### Rescue & Intake (`rescue.html`)
- Aurora Rescue Network overview
- Step-by-step rescue process
- Information checklist for accurate reporting
- Rescue report form capturing location, timeline, child condition, safety concerns, and evidence
- Automatic case reference generation and follow-up workflow
- Rescue-specific FAQ

### Donate (`donate.html`)
- Comprehensive donation form
- Quick amount selection buttons
- Custom amount input
- Donation type selection (one-time, monthly, yearly)
- Designation options
- Donor information form
- Impact information showing what donations provide

### Contact (`contact.html`)
- Contact information
- Contact form with subject selection
- Map placeholder (ready for Google Maps integration)
- FAQ accordion section
- Social media links

## 🎨 Customization

### Colors
The website uses CSS variables for easy color customization. Edit the `:root` section in `styles.css`:

```css
:root {
    --primary-color: #4A90E2;      /* Main brand color */
    --secondary-color: #F5A623;    /* Accent color */
    --accent-color: #7B68EE;       /* Secondary accent */
    --dark-color: #2C3E50;         /* Dark text/backgrounds */
    /* ... */
}
```

### Content
- Update contact information in all HTML files
- Modify mission statements and values
- Add real team member information
- Update statistics and impact numbers
- Replace placeholder images with actual photos
- Populate child profiles with real data, health reports, and video links
- Configure rescue form notification endpoints

### Integration
- **Payment Processing**: Integrate with Stripe, PayPal, or other payment processors in `script.js`
- **Email Service**: Connect contact, adoption, and rescue forms to email service (SendGrid, Mailgun, etc.)
- **Google Maps**: Replace map placeholder with actual Google Maps embed
- **Analytics**: Add Google Analytics or similar tracking
- **Social Media**: Update social media links with actual profiles
- **Case Management**: Connect rescue reports to backend or CRM for workflow automation

## 📱 Responsive Design

The website is fully responsive and optimized for:
- **Mobile devices** (320px and up)
- **Tablets** (768px and up)
- **Desktop** (1024px and up)
- **Large screens** (1200px and up)

## 🔒 Security Notes

For production deployment:
1. Implement server-side form validation
2. Use HTTPS for all pages
3. Integrate with a secure payment processor
4. Add CSRF protection for forms
5. Implement rate limiting for form submissions
6. Add proper error handling
7. Securely store rescue report data and limit access to authorized personnel

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License

This project is created for Aurora House. All rights reserved.

## 🤝 Contributing

To contribute to this project:
1. Make your changes
2. Test thoroughly across different devices
3. Ensure all forms work correctly (donation, adoption, rescue, contact)
4. Check responsive design
5. Submit your changes

## 📞 Support

For questions or support regarding this website:
- Email: info@aurorahouse.org
- Rescue Hotline: rescue@aurorahouse.org | (555) 987-HELP
- Phone: (555) 123-4567

## 🎉 Acknowledgments

- Fonts: Google Fonts (Poppins, Playfair Display)
- Design inspiration: Modern nonprofit websites
- Icons: Emoji-based for universal compatibility

---

**Made with ❤️ for Aurora House**

*Illuminating lives, one child at a time.*


http://localhost:3000/api/submissions
http://localhost:3000/api/children
