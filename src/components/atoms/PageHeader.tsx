const PageHeader = ({ title, description }: { title: string; description: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{title}</h1>
      <p className="text-sm text-foreground">{description}</p>
    </div>
  );
};


export default PageHeader;