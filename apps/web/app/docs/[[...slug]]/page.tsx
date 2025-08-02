import { Mdx } from '@/components/mdx-components';
import { DocsPager } from '@/components/pager';
import { PayKitCloudCard } from '@/components/paykit-cloud-card';
import { DashboardTableOfContents } from '@/components/toc';
import { getTableOfContents } from '@/lib/toc';
import { badgeVariants, cn } from '@paykit-sdk/ui';
import { allDocs } from 'contentlayer/generated';
import { ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Balancer from 'react-wrap-balancer';

export const dynamic = 'force-dynamic';

interface DocPageProps {
  params: Promise<{ slug: string[] }>;
}

async function getDocFromParams({ params }: DocPageProps) {
  const { slug } = await params;

  const doc = allDocs.find(doc => doc.slugAsParams === (slug?.join('/') || ''));

  if (!doc) return null;

  return doc;
}

/**
 * todo:
 */
// export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
//   const doc = await getDocFromParams({ params });

//   if (!doc) return {};

//   return {
//     title: doc.title,
//     description: doc.description,
//     openGraph: {
//       title: doc.title,
//       description: doc.description,
//       type: 'article',
//       url: absoluteUrl(doc.slug),
//       images: [`/og?title=${encodeURIComponent(doc.title)}&description=${encodeURIComponent(doc.description)}`],
//     },
//     twitter: {
//       card: 'summary_large_image',
//       title: doc.title,
//       description: doc.description,
//       images: [`/og?title=${encodeURIComponent(doc.title)}&description=${encodeURIComponent(doc.description)}`],
//       creator: '@devodii',
//     },
//   };
// }

export async function generateStaticParams() {
  return allDocs.map(doc => ({ slug: doc.slugAsParams.split('/') }));
}

export default async function DocPage({ params }: DocPageProps) {
  const doc = await getDocFromParams({ params });

  if (!doc) notFound();

  const toc = getTableOfContents(doc.body.raw);

  return (
    <div className="flex w-full">
      <div className="flex-1 px-6 py-8 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="text-muted-foreground mb-6 flex items-center space-x-1 text-sm">
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{doc.title}</span>
          </div>

          <div className="mb-8 space-y-4">
            <h1 className="text-foreground text-4xl font-bold tracking-tight">{doc.title}</h1>
            {doc.description && (
              <p className="text-muted-foreground text-lg leading-relaxed">
                <Balancer>{doc.description}</Balancer>
              </p>
            )}
          </div>

          {doc.links ? (
            <div className="mb-8 flex items-center space-x-2">
              {doc.links?.doc && (
                <Link
                  href={doc.links.doc}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(badgeVariants({ variant: 'secondary' }), 'hover:bg-secondary/80 gap-1 transition-colors')}
                >
                  Docs
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
              {doc.links?.api && (
                <Link
                  href={doc.links.api}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(badgeVariants({ variant: 'secondary' }), 'hover:bg-secondary/80 gap-1 transition-colors')}
                >
                  API Reference
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          ) : null}

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <Mdx code={doc.body.code} />
          </div>

          <div className="mt-12 border-t pt-8">
            <DocsPager doc={doc} />
          </div>
        </div>
      </div>

      {doc.toc && (
        <div className="bg-muted/30 w-80 shrink-0 border-l">
          <div className="sticky top-20 p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-foreground/80 text-sm font-semibold tracking-wider uppercase">On this page</h4>
                <DashboardTableOfContents toc={toc} />
              </div>
              <PayKitCloudCard />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
