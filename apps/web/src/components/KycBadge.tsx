'use client';

interface KycBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const KYC_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  VERIFIED: { bg: 'bg-green-900/30', text: 'text-green-400', label: 'Verified' },
  PENDING: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', label: 'Pending' },
  REJECTED: { bg: 'bg-red-900/30', text: 'text-red-400', label: 'Rejected' },
};

export function KycBadge({ status, size = 'sm' }: KycBadgeProps) {
  const config = KYC_STYLES[status] || { bg: 'bg-navy-700', text: 'text-navy-400', label: status };

  const sizeClasses = size === 'md'
    ? 'px-3 py-1 text-sm'
    : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 rounded font-semibold ${config.bg} ${config.text} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.text === 'text-green-400' ? 'bg-green-400' : config.text === 'text-yellow-400' ? 'bg-yellow-400' : 'bg-red-400'}`} />
      {config.label}
    </span>
  );
}
