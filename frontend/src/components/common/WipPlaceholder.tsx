type WipPlaceholderProps = {
  title: string;
  description?: string;
};

export function WipPlaceholder({ title, description }: WipPlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">
        {description ?? "To be implemented"}
      </p>
    </div>
  );
}
