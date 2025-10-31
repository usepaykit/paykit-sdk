import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import { join } from 'path';
import rehypeSlug from 'rehype-slug';

export const Doc = defineDocumentType(() => ({
  name: 'Doc',
  filePathPattern: `docs/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    date: { type: 'date', required: true },
    published: { type: 'boolean', default: true },
    toc: { type: 'boolean', default: true },
    links: { type: 'json', of: { doc: { type: 'string' }, api: { type: 'string' } } },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: doc => `/${doc._raw.flattenedPath}`,
    },
    slugAsParams: {
      type: 'string',
      resolve: doc => doc._raw.flattenedPath.split('/').slice(1).join('/'),
    },
  },
}));

export const Changelog = defineDocumentType(() => ({
  name: 'Changelog',
  filePathPattern: `changelog/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: false },
    date: { type: 'date', required: true },
    published: { type: 'boolean', default: true },
    author: { type: 'string', required: false },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: doc =>
        `/changelog/${doc._raw.flattenedPath.split('/').slice(1).join('/')}`,
    },
    slugAsParams: {
      type: 'string',
      resolve: doc => doc._raw.flattenedPath.split('/').slice(1).join('/'),
    },
  },
}));

export default makeSource({
  contentDirPath: join(process.cwd(), 'content'),
  documentTypes: [Doc, Changelog],
  mdx: { rehypePlugins: [rehypeSlug] },
});
