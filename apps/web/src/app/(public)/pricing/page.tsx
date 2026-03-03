export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">Fees & Spreads</h1>
      <p className="text-navy-400 mb-12">Full transparency on how your execution price is calculated.</p>

      <div className="bg-navy-800 border border-navy-700 rounded-lg p-8 space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Price Components</h2>
          <p className="text-sm text-navy-400 mb-4">
            Your execution price is spot + supplier premium + platform spread + shipping (if applicable).
          </p>
          <p className="text-sm text-navy-400">
            Quotes lock your total for a short window to prevent slippage.
          </p>
        </div>

        <div className="border-t border-navy-700 pt-6">
          <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-wider mb-4">Breakdown</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-navy-400">Spot Price</span>
              <span className="text-navy-200">Live market rate per troy oz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Supplier Premium</span>
              <span className="text-navy-200">Varies by product and supplier</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Platform Spread</span>
              <span className="text-navy-200">Flat fee per unit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Shipping</span>
              <span className="text-navy-200">Based on delivery method and destination</span>
            </div>
          </div>
        </div>

        <div className="border-t border-navy-700 pt-6">
          <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-wider mb-4">Quote Lock</h3>
          <p className="text-sm text-navy-400">
            When you lock a quote, the total execution price is frozen for 30 seconds. During this window,
            you can complete checkout without price movement. If the quote expires, you can request a new one
            at the current market rate.
          </p>
        </div>
      </div>
    </div>
  );
}
