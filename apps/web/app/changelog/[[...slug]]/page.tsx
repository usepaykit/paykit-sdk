import { Mdx } from '@/components/mdx-components';
import { allChangelogs } from 'contentlayer/generated';
import Link from 'next/link';

export const dynamic = 'force-static';

interface ChangelogPageProps {
  params: Promise<{ slug?: string[] }>;
}

async function getChangelogFromParams({ params }: ChangelogPageProps) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return null; // Return null to show list
  }

  const slugAsParams = slug.join('/');
  const changelog = allChangelogs.find(
    doc => doc.slugAsParams === slugAsParams && doc.published !== false,
  );

  return changelog || null;
}

export default async function ChangelogPage({ params }: ChangelogPageProps) {
  const changelog = await getChangelogFromParams({ params });

  if (!changelog) {
    const items = allChangelogs
      .filter(p => p.published !== false)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-6 text-3xl font-bold">Changelog</h1>
        <ul className="space-y-6">
          {items.map(item => (
            <li key={item._id} className="rounded-xl border p-4">
              <div className="text-muted-foreground mb-1 text-sm">
                {new Date(item.date).toLocaleDateString()}
              </div>
              <h2 className="text-xl font-semibold">
                <Link href={item.slug}>{item.title}</Link>
              </h2>
              {item.description ? (
                <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/changelog"
        className="text-muted-foreground hover:text-foreground mb-6 text-sm"
      >
        ← Back to Changelog
      </Link>
      <div className="text-muted-foreground mb-2 text-sm">
        {new Date(changelog.date).toLocaleDateString()}
      </div>
      <h1 className="mb-4 text-3xl font-bold">{changelog.title}</h1>
      {changelog.description && (
        <p className="text-muted-foreground mb-8 text-lg">{changelog.description}</p>
      )}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <Mdx code={changelog.body.code} />
      </div>
    </div>
  );
}
