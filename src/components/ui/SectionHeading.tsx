interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  accent?: boolean;
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  accent = true,
}: SectionHeadingProps) {
  return (
    <div
      className={`mb-12 ${align === "center" ? "text-center" : "text-left"}`}
    >
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {accent && (
        <div
          className={`mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-da-indigo to-da-purple ${
            align === "center" ? "mx-auto" : ""
          }`}
        />
      )}
      {subtitle && (
        <p className="mt-4 max-w-2xl text-lg text-da-muted mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
