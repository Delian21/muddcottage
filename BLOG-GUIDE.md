# How to Add a Blog Post

## Option 1: Using the Admin Panel (Easiest)

1. Go to `yourwebsite.com/admin`
2. Log in (you'll need to set up an account the first time)
3. Click **Blog Posts** → **New Blog Post**
4. Fill in the fields:
   - **Title** — Your post title
   - **Publish Date** — When to publish
   - **Category** — Pick from: Herbal Medicine, Wellness, Remedies, Lifestyle, Tips
   - **Featured Image** — Upload a photo
   - **Description** — A short summary (160 characters max)
   - **Body** — Write your article using the rich text editor
   - **CTA Heading** — e.g. "Want to try these herbs?"
   - **CTA Text** — e.g. "Message us on WhatsApp to learn more."
5. Click **Publish**

That's it. The post appears on your blog automatically.

---

## Option 2: Editing Files Directly (For Developers)

### Adding a new blog post:

1. Open `blog/posts.json`
2. Add a new entry at the top of the list:
```json
{
  "slug": "your-post-url",
  "title": "Your Post Title",
  "date": "2026-09-15",
  "category": "Wellness",
  "description": "Short description of your post.",
  "image": "../images/your-image.jpg",
  "readTime": "5 min read"
}
```
3. Create the post HTML file by copying `blog/template.html`
4. Rename it to `blog/your-post-url.html`
5. Update the title, description, image, and write your content
6. Done — the blog page picks it up automatically

### Removing a post:
1. Delete the entry from `blog/posts.json`
2. Delete the HTML file from `blog/`
