export default function RiskDisclosuresPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">Risk Disclosures</h1>
      <p className="text-sm text-navy-500 mb-8">Last updated: March 2026</p>
      <div className="bg-navy-800 border border-navy-700 rounded-lg p-8 space-y-6 text-sm text-navy-300 leading-relaxed">
        <div className="bg-gold-500/10 border border-gold-500/30 rounded p-4">
          <p className="text-gold-300 font-semibold">
            Precious metals involve risk. Past performance does not guarantee future results.
          </p>
        </div>
        <h2 className="text-lg font-semibold text-white">Market Risk</h2>
        <p>The value of precious metals fluctuates based on market conditions. You may receive less than your original purchase price when selling.</p>
        <h2 className="text-lg font-semibold text-white">Liquidity Risk</h2>
        <p>Physical metals may not be immediately liquid. Settlement timelines vary by delivery method and supplier availability.</p>
        <h2 className="text-lg font-semibold text-white">Counterparty Risk</h2>
        <p>Orders are fulfilled by third-party suppliers. While we vet all suppliers, Constitutional Tender cannot guarantee fulfillment in all circumstances.</p>
        <h2 className="text-lg font-semibold text-white">No Leverage</h2>
        <p>Constitutional Tender does not offer leveraged products, margin trading, or derivatives. All transactions are fully funded.</p>
      </div>
    </div>
  );
}
