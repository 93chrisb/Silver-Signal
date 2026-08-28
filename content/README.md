# The blog CMS

There's no dashboard or login here on purpose. It's a very basic CMS: every
blog post is one Markdown file in `content/blog/`, and a build script turns
those files into the actual `/blog/` pages, keeping `sitemap.xml` in sync at
the same time. This is the whole system.

## Add a new post

1. Run `npm run new-post -- "Your Post Title"` from the repo root. This
   creates `content/blog/your-post-title.md` with the required fields
   already filled in.
2. Open that file and write the post in plain Markdown below the `---`
   frontmatter block. Headings (`##`), paragraphs, bullet lists (`-`), and
   links (`[text](url)`) all work.
3. Fill in a real `description` (one or two sentences — this is what shows
   up on the blog index and in Google/social link previews).
4. Set `draft: false` (or delete the `draft` line) when it's ready to go
   live. Leave it as `draft: true` while you're still writing; draft posts
   are skipped and never appear on the site.
5. Run `npm run build`, then commit and push.

Once merged to `main`, `.github/workflows/build.yml` runs the same build
automatically on every push that touches `content/blog/`, so `/blog/`,
`/contact/`, and `sitemap.xml` never drift out of sync with what's actually
in this folder — you don't need to remember to rebuild by hand after a merge.

## Frontmatter reference

```yaml
---
title: "Post title"                # required — used as the <h1> and <title>
description: "One or two sentences" # required — meta description, OG/Twitter card, blog card blurb
date: "2026-01-30"                  # required — YYYY-MM-DD, drives sort order and the sitemap
author: "Silver Signal Team"        # optional — defaults to "Silver Signal Team"
image: "https://.../image.png"      # optional — per-post OG image; defaults to the site OG image
updated: "2026-02-05"                # optional — set if you edit a published post; defaults to `date`
draft: true                          # optional — true hides the post from the build entirely
---
```

## Editing or unpublishing a post

- **Edit:** change the Markdown, bump `updated:` to today's date, run
  `npm run build`.
- **Unpublish:** either delete the `.md` file or set `draft: true`, then run
  `npm run build` — the build removes the old generated page automatically
  and drops it from the sitemap.

## Removing this CMS

Nothing here is a dependency for the rest of the site — `index.html` doesn't
import anything from `scripts/` or `content/`. Deleting `content/`,
`scripts/`, `styles/`, `blog/`, and the GitHub Action leaves the homepage and
`/contact/` (once its markup is copied to a plain static file) working
exactly as before.
