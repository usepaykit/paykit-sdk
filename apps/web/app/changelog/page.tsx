import { allChangelogs } from 'contentlayer/generated';
import Link from 'next/link';

export const dynamic = 'force-static';

export default function ChangelogPage() {
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
