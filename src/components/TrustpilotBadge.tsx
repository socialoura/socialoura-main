'use client';

export default function TrustpilotBadge() {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2"
      aria-label="Trustpilot rating 4.8 out of 5"
    >
      <span className="text-sm font-black text-white">4.8</span>
      <span className="h-4 w-px bg-white/20" />
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="inline-flex items-center justify-center w-5 h-5 rounded-[3px]"
            style={{ backgroundColor: '#00b67a' }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white" aria-hidden="true">
              <path d="M12 17.27l-5.18 3.05 1.4-5.95L3.5 9.24l6.06-.52L12 3l2.44 5.72 6.06.52-4.72 5.13 1.4 5.95z" />
            </svg>
          </span>
        ))}
      </span>
    </div>
  );
}
