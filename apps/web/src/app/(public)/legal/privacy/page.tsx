export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
      <p className="text-sm text-navy-500 mb-8">Last updated: March 2026</p>
      <div className="bg-navy-800 border border-navy-700 rounded-lg p-8 space-y-6 text-sm text-navy-300 leading-relaxed">
        <h2 className="text-lg font-semibold text-white">Information We Collect</h2>
        <p>We collect identity information for KYC/AML compliance, transaction data for order fulfillment, and usage data for platform improvement.</p>
        <h2 className="text-lg font-semibold text-white">How We Use Your Information</h2>
        <p>Your data is used to process transactions, verify identity, comply with regulations, and improve service quality. We do not sell personal data to third parties.</p>
        <h2 className="text-lg font-semibold text-white">Data Security</h2>
        <p>All data is encrypted at rest and in transit. Authentication is handled via Auth0 with industry-standard protocols.</p>
        <h2 className="text-lg font-semibold text-white">Data Retention</h2>
        <p>Transaction records are retained for regulatory compliance. You may request deletion of non-regulated personal data by contacting support.</p>
      </div>
    </div>
  );
}
