'use client';

const STAGE_CONFIG: Record<string, { label: string; description: string }> = {
  PRICE_LOCKED: { label: 'Price Locked', description: 'Spot price frozen for execution' },
  FUNDS_CONFIRMED: { label: 'Funds Confirmed', description: 'Payment received and verified' },
  SUPPLIER_CONFIRMED: { label: 'Supplier Confirmed', description: 'Supplier accepted the order' },
  SHIPMENT_CREATED: { label: 'Shipment Created', description: 'Package prepared for shipping' },
  IN_TRANSIT: { label: 'In Transit', description: 'Shipment en route to destination' },
  DELIVERED: { label: 'Delivered', description: 'Package delivered successfully' },
  VAULT_ALLOCATED: { label: 'Vault Allocated', description: 'Metal allocated in vault storage' },
  CANCELLED: { label: 'Cancelled', description: 'Order was cancelled' },
};

const STAGE_ORDER = [
  'PRICE_LOCKED',
  'FUNDS_CONFIRMED',
  'SUPPLIER_CONFIRMED',
  'SHIPMENT_CREATED',
  'IN_TRANSIT',
  'DELIVERED',
];

interface TimelineEvent {
  id: string;
  stage: string;
  note: string | null;
  createdAt: string;
}

interface OrderTimelineProps {
  currentStatus: string;
  events: TimelineEvent[];
  deliveryType: string;
}

export function OrderTimeline({ currentStatus, events, deliveryType }: OrderTimelineProps) {
  const stages = deliveryType === 'VAULT_ALLOCATE'
    ? [...STAGE_ORDER.slice(0, 3), 'VAULT_ALLOCATED']
    : STAGE_ORDER;

  const eventMap = new Map(events.map((e) => [e.stage, e]));
  const currentIdx = stages.indexOf(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  return (
    <div className="space-y-0">
      {stages.map((stage, idx) => {
        const config = STAGE_CONFIG[stage];
        const event = eventMap.get(stage);
        const isComplete = idx <= currentIdx && !isCancelled;
        const isCurrent = idx === currentIdx && !isCancelled;
        const isFuture = idx > currentIdx || isCancelled;

        return (
          <div key={stage} className="flex gap-4">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                  isCurrent
                    ? 'border-gold-400 bg-gold-400'
                    : isComplete
                      ? 'border-green-400 bg-green-400'
                      : 'border-navy-600 bg-navy-800'
                }`}
              />
              {idx < stages.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-[2rem] ${
                    isComplete && idx < currentIdx ? 'bg-green-400/30' : 'bg-navy-700'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-4 ${isFuture ? 'opacity-40' : ''}`}>
              <div className={`text-sm font-medium ${isCurrent ? 'text-gold-400' : isComplete ? 'text-white' : 'text-navy-500'}`}>
                {config?.label || stage}
              </div>
              <div className="text-xs text-navy-500">
                {config?.description || ''}
              </div>
              {event && (
                <div className="text-xs text-navy-400 mt-1">
                  {new Date(event.createdAt).toLocaleString()}
                  {event.note && <span className="ml-2 text-navy-500">— {event.note}</span>}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full border-2 border-red-400 bg-red-400 flex-shrink-0" />
          </div>
          <div className="pb-4">
            <div className="text-sm font-medium text-red-400">Cancelled</div>
            <div className="text-xs text-navy-500">Order was cancelled</div>
            {eventMap.get('CANCELLED') && (
              <div className="text-xs text-navy-400 mt-1">
                {new Date(eventMap.get('CANCELLED')!.createdAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
