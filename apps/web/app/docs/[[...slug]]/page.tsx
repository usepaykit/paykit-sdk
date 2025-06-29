import { Mdx } from '@/components/mdx-components';
import { DocsPager } from '@/components/pager';
import { DashboardTableOfContents } from '@/components/toc';
import { badgeVariants } from '@/components/ui/badge';
import { getTableOfContents } from '@/lib/toc';
import { absoluteUrl, cn } from '@/lib/utils';
import '@/styles/mdx.css';
import { allDocs } from 'contentlayer/generated';
import { ChevronRight, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Balancer from 'react-wrap-balancer';

interface DocPageProps {
  params: {
    slug: string[];
  };
}

async function getDocFromParams({ params }: DocPageProps) {
  const slug = params.slug?.join('/') || '';
  const doc = allDocs.find(doc => doc.slugAsParams === slug);

  if (!doc) {
    return null;
  }

  return doc;
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const doc = await getDocFromParams({ params });

  if (!doc) {
    return {};
  }

  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: 'article',
      url: absoluteUrl(doc.slug),
      images: [`/og?title=${encodeURIComponent(doc.title)}&description=${encodeURIComponent(doc.description)}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: doc.title,
      description: doc.description,
      images: [`/og?title=${encodeURIComponent(doc.title)}&description=${encodeURIComponent(doc.description)}`],
      creator: '@paykit-sdk',
    },
  };
}

export async function generateStaticParams(): Promise<DocPageProps['params'][]> {
  return allDocs.map(doc => ({ slug: doc.slugAsParams.split('/') }));
}

export default async function DocPage({ params }: DocPageProps) {
  const doc = await getDocFromParams({ params });

  if (!doc) notFound();

  const toc = await getTableOfContents(doc.body.raw);

  return (
    <div className="flex w-full">
      <div className="flex-1 px-6 py-8 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center space-x-1 text-sm text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{doc.title}</span>
          </div>
          
          <div className="space-y-4 mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {doc.title}
            </h1>
            {doc.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                <Balancer>{doc.description}</Balancer>
              </p>
            )}
          </div>

          {doc.links ? (
            <div className="flex items-center space-x-2 mb-8">
              {doc.links?.doc && (
                <Link href={doc.links.doc} target="_blank" rel="noreferrer" className={cn(badgeVariants({ variant: 'secondary' }), 'gap-1 hover:bg-secondary/80 transition-colors')}>
                  Docs
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
              {doc.links?.api && (
                <Link href={doc.links.api} target="_blank" rel="noreferrer" className={cn(badgeVariants({ variant: 'secondary' }), 'gap-1 hover:bg-secondary/80 transition-colors')}>
                  API Reference
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          ) : null}

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <Mdx code={doc.body.code} />
          </div>
          
          <div className="mt-12 pt-8 border-t">
            <DocsPager doc={doc} />
          </div>
        </div>
      </div>
      
      {doc.toc && (
        <div className="hidden xl:block w-80 shrink-0 border-l bg-muted/30">
          <div className="sticky top-20 p-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                On this page
              </h4>
              <DashboardTableOfContents toc={toc} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
