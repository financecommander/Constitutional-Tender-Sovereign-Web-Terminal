const faqs = [
  {
    q: 'What metals can I buy?',
    a: 'Gold and silver in various forms including bars and coins from sovereign and private mints.',
  },
  {
    q: 'How does pricing work?',
    a: 'Your execution price is the live spot rate plus a supplier premium, platform spread, and shipping (if applicable). Every component is disclosed before you lock your quote.',
  },
  {
    q: 'What is a quote lock?',
    a: 'When you lock a quote, your total price is frozen for 30 seconds. This prevents slippage while you complete checkout. If the quote expires, you can request a new one.',
  },
  {
    q: 'How is my metal delivered?',
    a: 'You can choose direct shipment to your address or allocation in an audited vault. Shipment tracking is provided for all direct deliveries.',
  },
  {
    q: 'Do I need to verify my identity?',
    a: 'Yes. KYC/AML verification is required before you can trade. You can browse products and view pricing without verification.',
  },
  {
    q: 'Is there leverage or margin trading?',
    a: 'No. Constitutional Tender is physical metal only. No leverage, no derivatives, no margin.',
  },
  {
    q: 'What currencies are supported?',
    a: 'USD, EUR, CHF, SGD, KYD, and GBP. Your base currency can be set in profile settings.',
  },
  {
    q: 'How do I track my order?',
    a: 'Every order has a timeline showing each stage from price lock through delivery. You also receive a printable receipt with full details.',
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">FAQ</h1>
      <p className="text-navy-400 mb-12">Common questions about Constitutional Tender.</p>

      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-navy-800 border border-navy-700 rounded-lg p-6">
            <h2 className="text-base font-semibold text-white mb-2">{faq.q}</h2>
            <p className="text-sm text-navy-400">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
