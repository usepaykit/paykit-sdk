export interface TocItem {
  level: number;
  title: string;
  id: string;
  children?: TocItem[];
}

export type Toc = TocItem[];

export function getTableOfContents(content: string): Toc {
  const regex = /^(#{1,6})\s+(.+)$/gm;
  const toc: Toc = [];

  let match;
  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    toc.push({ level, title, id });
  }

  return toc;
}
