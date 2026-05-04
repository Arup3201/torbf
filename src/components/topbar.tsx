import { Logo } from "./logo";

export function TopBar({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border shrink-0">
      {/* Mobile logo row */}
      <div className="md:hidden px-4 py-2">
        <Logo />
      </div>

      {/* Main header row */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:h-14 gap-3">
        <h1 className="text-base md:text-lg font-semibold text-text-primary truncate">
          {title}
        </h1>

        {actions && (
          <div className="flex items-center justify-end gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
