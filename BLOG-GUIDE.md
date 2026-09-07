# How to Add a Blog Post

## The Easy Way: Using the Admin Panel (recommended)

1. Go to `yourwebsite.com/admin` (e.g. `muddcottage.netlify.app/admin`)
2. Log in with your email and password (first time: you'll receive an invite email from Netlify — click the link and set a password)
3. Click **Blog Posts** → **New Blog post**
4. Fill in the fields:
   - **Title** — Your post title
   - **Publish Date** — When to publish
   - **Category** — Pick from: Herbal Medicine, Wellness, Remedies, Lifestyle, Tips
   - **Featured Image** — Upload a photo
   - **Description** — A short summary (160 characters max)
   - **Read Time** — e.g. "5 min read"
   - **Body** — Write your article using the rich text editor
   - **CTA Heading** — e.g. "Want to try these herbs?"
   - **CTA Text** — e.g. "Message us on WhatsApp to learn more."
5. Click **Publish**, wait about a minute for the site to rebuild
6. Your post appears on the blog page automatically — no coding, no files

## How it works (for reference)

- Publishing in the admin panel saves a markdown file to `blog/posts/` in the GitHub repo
- On every deploy, Netlify runs `node scripts/build-blog.js`, which turns each markdown file into `blog/posts.json` and a full HTML page in `blog/`
- The post URL is always `yourwebsite.com/blog/<name>.html`, where `<name>` comes from the title you type

## Tips for writing in the editor

- Use the toolbar for **bold**, headings, lists, and links — no HTML needed
- Keep paragraphs short (2–4 sentences) for easy reading on phones
- The **Description** field is what shows on the blog listing card and in Google results
- Featured images look best at roughly 4:3 or 16:9 (landscape)

## For developers: editing posts directly

Posts live in `blog/posts/*.md` with YAML frontmatter:

```markdown
---
title: "Your Post Title"
date: 2026-09-15
category: "Wellness"
thumbnail: "/images/your-image.jpg"
description: "Short description of your post."
readTime: "5 min read"
cta_heading: "Have a question?"
cta_text: "Message us on WhatsApp."
---

Your article body in markdown.
```

After editing, run `node scripts/build-blog.js` to regenerate `blog/posts.json` and the HTML pages, then commit everything (markdown + generated files together).

### Removing a post

Delete the post's `.md` file from `blog/posts/`, run the build script, and commit. The HTML page and listing entry disappear on the next deploy.

> Note: don't hand-edit the generated `blog/*.html` post pages or `blog/posts.json` — they are overwritten by the build script. Edit the markdown instead.
