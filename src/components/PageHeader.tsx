interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-lg text-stone-500">{subtitle}</p>
      )}
    </div>
  );
}
