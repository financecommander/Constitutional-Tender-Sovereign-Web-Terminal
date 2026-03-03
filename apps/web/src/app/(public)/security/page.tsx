export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">Security & Compliance</h1>
      <p className="text-navy-400 mb-12">
        KYC/AML screening, jurisdiction checks, and immutable receipts.
      </p>

      <div className="space-y-8">
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Identity Verification</h2>
          <p className="text-sm text-navy-400">
            All users complete KYC/AML screening before trading is enabled. View-only access
            is available immediately upon account creation.
          </p>
        </div>

        <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Physical Metal Only</h2>
          <p className="text-sm text-navy-400">
            No leverage. No derivatives. Every order results in physical metal fulfillment &mdash;
            either direct shipment to your address or allocation in an audited vault.
          </p>
        </div>

        <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Immutable Receipts</h2>
          <p className="text-sm text-navy-400">
            Every transaction produces a timestamped receipt showing the locked spot price,
            supplier premium, platform spread, and settlement timeline. Receipts cannot be
            altered after creation.
          </p>
        </div>

        <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Infrastructure</h2>
          <p className="text-sm text-navy-400">
            Authentication via Auth0 with RS256 JWT tokens. Encrypted at rest and in transit.
            Rate-limited API endpoints. Jurisdiction-aware compliance checks.
          </p>
        </div>
      </div>
    </div>
  );
}
