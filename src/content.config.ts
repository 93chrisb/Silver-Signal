import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Slugs come from the filename, which is what the previous build script used.
// Keeping that mapping means every published /blog/<slug>/ URL survives the move.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string().default('Silver Signal Team'),
    image: z.string().optional(),
    slug: z.string().optional(),
  }),
});

export const collections = { blog };
