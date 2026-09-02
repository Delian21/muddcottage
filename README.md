# Mudd Cottage Herbhome

A modern static website for **Mudd Cottage Herbhome** — herbal teas, remedies, and wellness guidance rooted in tradition.

**Live site:** [muddcottage.netlify.app](https://muddcottage.netlify.app)

## About

Mudd Cottage Herbhome is a herbal wellness brand based in Aboh-Mbiase, Owerri, Imo State, Nigeria. The site showcases their services, shares educational blog content, and makes it easy for visitors to get in touch via WhatsApp or a contact form.

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, story, services, testimonials, trust bar |
| About | `about.html` | Full story, team, focus areas, testimonials |
| Services | `services.html` | Offerings, how it works, CTA |
| Blog | `blog.html` | Herbal wellness articles |
| Videos | `videos.html` | Embedded video content |
| Contact | `contact.html` | Contact form, FAQ, WhatsApp integration |

## Blog Posts

| Post | File |
|------|------|
| Common Herbs Every Home Should Have | `blog/common-herbs-every-home.html` |
| Sleep Naturally with Herbal Remedies | `blog/sleep-naturally.html` |
| Why Herbs Still Work | `blog/why-herbs-still-work.html` |

## Features

- 🌿 Nature-inspired green/cream color theme
- 📱 Fully responsive (mobile, tablet, desktop)
- 💬 WhatsApp integration throughout (floating button + contact links)
- ✨ Scroll animations (Intersection Observer API)
- 🎯 SEO meta tags on every page
- 📊 Animated counters on trust bar
- 🍔 Mobile hamburger navigation
- 📝 Blog with JSON-based post management

## Tech Stack

- **HTML/CSS/JS** — no frameworks, no build tools
- **Netlify** — auto-deploys on push to `main`
- **GitHub** — version control

## File Structure

```
muddcottage/
├── index.html              # Homepage
├── about.html              # About page
├── services.html           # Services page
├── contact.html            # Contact page
├── blog.html               # Blog listing
├── videos.html             # Videos page
├── sitemap.xml             # SEO sitemap
├── css/
│   └── style.css           # Main stylesheet
├── js/
│   ├── main.js             # Animations, nav, form handling
│   └── blog.js             # Blog post rendering
├── blog/
│   ├── posts.json          # Blog post metadata
│   ├── template.html       # Blog post template
│   ├── common-herbs-every-home.html
│   ├── sleep-naturally.html
│   └── why-herbs-still-work.html
├── images/                 # Site images and assets
└── admin/                  # Decap CMS config (optional)
```

## Contact

- **WhatsApp:** +234 802 802 7119 / +234 803 476 9497
- **Email:** muddcottage1@gmail.com
- **Location:** Obokwe Obetiti, Trans-Amadi Bus-stop, Aboh-Mbiase, Owerri, Imo State, Nigeria
