export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 pt-20 text-center font-sans text-foreground">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-2xl">
        🚧
      </div>
      <h1 className="text-xl font-semibold text-card-foreground">{title}</h1>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
