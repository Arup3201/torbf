export function Logo() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5">
      <img
        src="torb.png"
        alt="TaskOrbit Logo"
        className="h-8 w-8 sm:h-10 sm:w-10 object-contain shrink-0"
      />
      <span className="inline text-base font-semibold text-text-primary tracking-snug">
        TaskOrbit
      </span>
    </div>
  );
}
