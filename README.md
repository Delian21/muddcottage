# Mudd Cottage Herbhome – Static Website

A standalone, secure, modern website for **Mudd Cottage Herbhome** — replacing the previous WordPress installation.

## Why Static?

- **🔒 Secure by design** — No database, no login panel, no PHP, no plugins to exploit
- **⚡ Fast** — Static HTML loads instantly, no server-side processing
- **💰 Free hosting** — Deploy to GitHub Pages, Netlify, Vercel, or any web host
- **🛡️ No maintenance** — No WordPress updates, no plugin patches, no security holes

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, story, services, testimonials, contact form |
| About | `about.html` | Full story, team, focus areas, testimonial |
| Services | `services.html` | Detailed offerings, how it works, 15% off CTA |
| Contact | `contact.html` | Contact form, FAQ, WhatsApp integration |

## Features

- 🌿 Nature-inspired green/cream color theme
- 📱 Fully responsive (mobile, tablet, desktop)
- 💬 WhatsApp integration throughout (floating button + form)
- ✨ Scroll animations (Intersection Observer API)
- 🎯 SEO meta tags on every page
- 📊 Animated counters for trust bar
- 🍔 Mobile hamburger navigation

## Setup

1. **Update the WhatsApp number** — Replace all instances of `2348100000000` with your actual number
2. **Update the email** — Replace `hello@muddcottage.com.ng` in contact.html
3. **Add real images** — Replace the placeholder divs with actual images:
   - Hero image on `index.html`
   - About image on `about.html`
   - Add your logo as an `<img>` tag
4. **Update social links** — Replace `#` placeholders in the footer with actual URLs

## Deploy

### Option 1: GitHub Pages (Free)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/muddcottage.git
git push -u origin main
```
Then enable GitHub Pages in repo settings.

### Option 2: Netlify (Free)
Drag and drop the project folder to [app.netlify.com/drop](https://app.netlify.com/drop)

### Option 3: Any Web Host
Upload all files via FTP/cPanel to your hosting provider's public_html directory.

## File Structure

```
muddcottage/
├── index.html          # Homepage
├── about.html          # About page
├── services.html       # Services page
├── contact.html        # Contact page
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   └── main.js         # JavaScript (animations, nav, form)
└── README.md           # This file
```

## Security Improvements Over WordPress

| Vulnerability | WordPress | This Site |
|--------------|-----------|-----------|
| User enumeration | ❌ Exposed | ✅ N/A (no users) |
| Login brute force | ❌ /wp-login.php | ✅ N/A (no login) |
| XML-RPC attacks | ❌ Active | ✅ N/A (no PHP) |
| Plugin exploits | ❌ 15+ plugins | ✅ N/A (no plugins) |
| Database injection | ❌ Possible | ✅ N/A (no database) |
| RSS username leak | ❌ admin exposed | ✅ N/A (no CMS) |
| Version disclosure | ❌ WP 7.1 shown | ✅ N/A (no version) |
