#!/usr/bin/env node
// Scaffolds a new content/blog/<slug>.md file with the required frontmatter
// filled in, so writing a post is "fill in the blanks" rather than
// remembering the field names. Usage: npm run new-post "My Post Title"
const fs = require("fs");
const path = require("path");

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: npm run new-post -- "My Post Title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

const today = new Date().toISOString().slice(0, 10);
const outPath = path.join(__dirname, "..", "content", "blog", `${slug}.md`);

if (fs.existsSync(outPath)) {
  console.error(`content/blog/${slug}.md already exists.`);
  process.exit(1);
}

const contents = `---
title: "${title}"
description: "One or two sentences. This is what shows up on the blog index and in Google/social previews, so make it count."
date: "${today}"
author: "Silver Signal Team"
draft: true
---

Write the post here in normal Markdown: ## for headings, blank lines between
paragraphs, - for bullet lists, [link text](https://example.com) for links.

Set \`draft: true\` above while you're still writing — draft posts are skipped
by the build and won't show up on the site. Flip it to \`draft: false\` (or
delete the line) when you're ready to publish, then run \`npm run build\`.
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, contents);
console.log(`Created content/blog/${slug}.md — edit it, then set draft: false and run "npm run build".`);
