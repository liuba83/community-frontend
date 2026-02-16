export function Logo() {
  return (
    <a href="/" className="flex items-center gap-2 no-underline">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="shrink-0">
        <path
          d="M16 2L4 28h4l2.5-5.5h11L24 28h4L16 2zm0 8l4 10H12l4-10z"
          fill="#00205B"
        />
        <path d="M13 18h6v2h-6z" fill="#0057B7" />
        <path d="M13 20h6v2h-6z" fill="#E52459" />
      </svg>
      <span className="text-dark-blue font-bold text-lg leading-tight hidden sm:block">
        Ukrainians<br />in Texas
      </span>
    </a>
  );
}
