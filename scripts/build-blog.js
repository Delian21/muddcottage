/**
 * Mudd Cottage Blog Build Script
 * ------------------------------
 * Reads markdown posts from blog/posts/ (written via the Decap CMS admin panel
 * or by hand) and generates:
 *   1. blog/posts.json  - metadata used by js/blog.js to render the blog listing
 *   2. blog/<slug>.html - a full HTML page per post, built from blog/template.html
 *
 * Runs automatically on every Netlify deploy (see netlify.toml).
 * Run locally with:  node scripts/build-blog.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'blog', 'posts');
const TEMPLATE_PATH = path.join(ROOT, 'blog', 'template.html');
const OUTPUT_JSON = path.join(ROOT, 'blog', 'posts.json');
const OUTPUT_DIR = path.join(ROOT, 'blog');

// Minimal YAML frontmatter parser (handles quoted and unquoted scalars).
function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error('Post is missing YAML frontmatter (--- title: ... ---)');
  }
  const meta = {};
  match[1].split(/\r?\n/).forEach(function (line) {
    const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) return;
    let value = m[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[m[1]] = value;
  });
  return { meta, body: text.slice(match[0].length) };
}

// Markdown -> HTML. Supports headings, bold, italics, links, lists, blockquotes,
// paragraphs. Deliberately small and dependency-free.
function markdownToHtml(md) {
  // Extract fenced/indented-free block structures line by line
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inList = false;
  let listType = null;
  let paragraph = [];

  function flushParagraph() {
    if (paragraph.length) {
      out.push('<p>' + inline(paragraph.join(' ')) + '</p>');
      paragraph = [];
    }
  }

  function closeList() {
    if (inList) {
      out.push(listType === 'ol' ? '</ol>' : '</ul>');
      inList = false;
      listType = null;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      out.push('<h' + level + '>' + inline(heading[2]) + '</h' + level + '>');
      continue;
    }

    const blockquote = line.match(/^>\s?(.*)$/);
    if (blockquote) {
      flushParagraph();
      closeList();
      out.push('<blockquote>' + inline(blockquote[1]) + '</blockquote>');
      continue;
    }

    const ulItem = line.match(/^[-*]\s+(.*)$/);
    if (ulItem) {
      flushParagraph();
      if (!inList || listType !== 'ul') {
        closeList();
        out.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      out.push('<li>' + inline(ulItem[1]) + '</li>');
      continue;
    }

    const olItem = line.match(/^\d+[.)]\s+(.*)$/);
    if (olItem) {
      flushParagraph();
      if (!inList || listType !== 'ol') {
        closeList();
        out.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      out.push('<li>' + inline(olItem[1]) + '</li>');
      continue;
    }

    // Anything else is paragraph text
    paragraph.push(line.trim());
  }

  flushParagraph();
  closeList();
  return out.join('\n        ');

  // Inline formatting: escape HTML first, then apply markdown syntax.
  function inline(text) {
    let s = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Links: [text](url)
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, label, url) {
      const safeUrl = url.replace(/"/g, '%22');
      const external = /^https?:\/\//i.test(safeUrl);
      return '<a href="' + safeUrl + '"' +
        (external ? ' target="_blank" rel="noopener"' : '') + '>' + label + '</a>';
    });

    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return s;
  }
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('No blog/posts directory found - nothing to build.');
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const files = fs.readdirSync(POSTS_DIR)
    .filter(function (f) { return f.endsWith('.md'); });

  if (files.length === 0) {
    console.error('No markdown posts found in blog/posts/');
    process.exit(1);
  }

  const posts = [];
  const errors = [];

  files.forEach(function (file) {
    const filePath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const slug = file.replace(/\.md$/, '');

    try {
      const { meta, body } = parseFrontmatter(raw);

      // Validate required fields so a bad CMS save never breaks the site
      const required = ['title', 'date', 'category', 'thumbnail', 'description'];
      const missing = required.filter(function (k) { return !meta[k]; });
      if (missing.length) {
        throw new Error('Missing required field(s): ' + missing.join(', '));
      }

      const dateMatch = String(meta.date).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!dateMatch) {
        throw new Error('Invalid date: ' + meta.date);
      }
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const isoDate = dateMatch[1] + '-' + dateMatch[2] + '-' + dateMatch[3];
      const prettyDate = months[parseInt(dateMatch[2], 10) - 1] + ' ' + parseInt(dateMatch[3], 10) + ', ' + dateMatch[1];

      posts.push({
        slug: slug,
        title: meta.title,
        date: isoDate,
        category: meta.category,
        description: meta.description,
        image: meta.thumbnail,
        readTime: meta.readTime || '5 min read'
      });

      // Image path: CMS saves "/images/uploads/x.jpg" which works on the live
      // site; when the page lives in /blog/, resolve to ../images/... for local
      // file:// preview friendliness. Both forms work on the server.
      const imageSrc = meta.thumbnail.startsWith('/')
        ? '..' + meta.thumbnail
        : meta.thumbnail;

      const html = template
        .replace(/\{\{title\}\}/g, escapeHtml(meta.title))
        .replace(/\{\{description\}\}/g, escapeHtml(meta.description))
        .replace(/\{\{category\}\}/g, escapeHtml(meta.category))
        .replace(/\{\{date\}\}/g, prettyDate)
        .replace(/\{\{readTime\}\}/g, escapeHtml(meta.readTime || '5 min read'))
        .replace(/\{\{image\}\}/g, imageSrc)
        .replace(/\{\{content\}\}/g, markdownToHtml(body))
        .replace(/\{\{cta_heading\}\}/g, escapeHtml(meta.cta_heading || 'Have a question about herbs?'))
        .replace(/\{\{cta_text\}\}/g, escapeHtml(meta.cta_text || "We're always happy to help. Reach out anytime."));

      fs.writeFileSync(path.join(OUTPUT_DIR, slug + '.html'), html, 'utf8');
      console.log('  built blog/' + slug + '.html');
    } catch (err) {
      errors.push(file + ': ' + err.message);
    }
  });

  if (errors.length) {
    console.error('\nFailed to build some posts:');
    errors.forEach(function (e) { console.error('  - ' + e); });
    process.exit(1);
  }

  // Sort newest first, then write posts.json
  posts.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(posts, null, 2) + '\n', 'utf8');
  console.log('  built blog/posts.json (' + posts.length + ' post' + (posts.length === 1 ? '' : 's') + ')');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

main();
