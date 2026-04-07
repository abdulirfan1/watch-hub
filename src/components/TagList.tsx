interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1" aria-label="Tags">
      {tags.map((tag) => (
        <li
          key={tag}
          className="px-2 py-0.5 text-xs bg-stone-100 text-stone-500 rounded-full"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
