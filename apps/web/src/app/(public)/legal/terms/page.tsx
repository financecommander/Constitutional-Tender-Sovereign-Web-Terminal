export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
      <p className="text-sm text-navy-500 mb-8">Last updated: March 2026</p>
      <div className="bg-navy-800 border border-navy-700 rounded-lg p-8 space-y-6 text-sm text-navy-300 leading-relaxed">
        <p>
          By accessing or using the Constitutional Tender platform, you agree to be bound by these
          Terms of Service. If you do not agree, do not use the platform.
        </p>
        <h2 className="text-lg font-semibold text-white">1. Eligibility</h2>
        <p>You must be at least 18 years old and have completed identity verification (KYC) to execute trades.</p>
        <h2 className="text-lg font-semibold text-white">2. Services</h2>
        <p>Constitutional Tender provides a platform for purchasing and selling physical precious metals. All transactions involve physical metal fulfillment via direct shipment or vault allocation.</p>
        <h2 className="text-lg font-semibold text-white">3. Pricing</h2>
        <p>Execution prices are based on live spot rates plus supplier premiums, platform spreads, and applicable shipping. Locked quotes are valid for the stated duration only.</p>
        <h2 className="text-lg font-semibold text-white">4. No Investment Advice</h2>
        <p>Constitutional Tender does not provide investment, tax, or legal advice. Precious metals are subject to price volatility.</p>
        <h2 className="text-lg font-semibold text-white">5. Limitation of Liability</h2>
        <p>Constitutional Tender LLC shall not be liable for losses arising from market movements, service interruptions, or third-party supplier actions.</p>
      </div>
    </div>
  );
}
