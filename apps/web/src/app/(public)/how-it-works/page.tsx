export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Verify Identity',
      desc: 'Complete KYC/AML screening to unlock trading. View-only access available immediately.',
    },
    {
      num: '02',
      title: 'Lock Price',
      desc: 'Select your metal, review the full price breakdown, and lock your execution price for 30 seconds.',
    },
    {
      num: '03',
      title: 'Settle & Track',
      desc: 'Choose direct shipment or vault allocation. Track every stage with timestamped updates and an auditable receipt.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">How It Works</h1>
      <p className="text-navy-400 mb-16">Three steps from price discovery to settlement.</p>

      <div className="space-y-16">
        {steps.map((step) => (
          <div key={step.num} className="flex items-start space-x-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-full border-2 border-gold-500 flex items-center justify-center">
              <span className="text-gold-400 font-bold text-lg">{step.num}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">{step.title}</h2>
              <p className="text-navy-400">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
