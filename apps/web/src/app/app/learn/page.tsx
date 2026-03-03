'use client';

import Link from 'next/link';

const guides = [
  {
    slug: 'why-precious-metals',
    title: 'Why Invest in Precious Metals?',
    description: 'Discover why gold, silver, platinum, and palladium have been stores of value for thousands of years and how they fit into a modern portfolio.',
    category: 'Getting Started',
    readTime: '8 min',
    icon: '🏛️',
  },
  {
    slug: 'gold-vs-silver',
    title: 'Gold vs Silver: Which Is Right for You?',
    description: 'Compare the two most popular precious metals across price, volatility, industrial demand, and portfolio allocation strategies.',
    category: 'Getting Started',
    readTime: '6 min',
    icon: '⚖️',
  },
  {
    slug: 'understanding-spot-price',
    title: 'Understanding the Spot Price',
    description: 'Learn what the spot price is, how it\'s determined, and why the price you pay includes a premium above spot.',
    category: 'Pricing',
    readTime: '5 min',
    icon: '📊',
  },
  {
    slug: 'premiums-spreads-explained',
    title: 'Premiums & Spreads Explained',
    description: 'What are dealer premiums? How do spreads work? Understand the true cost of buying and selling precious metals.',
    category: 'Pricing',
    readTime: '7 min',
    icon: '💰',
  },
  {
    slug: 'dollar-cost-averaging',
    title: 'Dollar-Cost Averaging (DCA) Strategy',
    description: 'Why buying a fixed dollar amount on a regular schedule can reduce your average cost and smooth out market volatility.',
    category: 'Strategies',
    readTime: '6 min',
    icon: '📈',
  },
  {
    slug: 'coins-bars-rounds',
    title: 'Coins, Bars & Rounds: What to Buy',
    description: 'Compare government-minted coins, private mint bars, and rounds. Learn about premiums, liquidity, and recognizability.',
    category: 'Products',
    readTime: '8 min',
    icon: '🪙',
  },
  {
    slug: 'storage-options',
    title: 'Storing Your Precious Metals Safely',
    description: 'Home safes, bank safe deposit boxes, and allocated vault storage. Pros, cons, and insurance considerations.',
    category: 'Ownership',
    readTime: '7 min',
    icon: '🔒',
  },
  {
    slug: 'tax-implications',
    title: 'Tax Implications of Precious Metals',
    description: 'Capital gains, IRS reporting requirements, 1099-B forms, and state sales tax exemptions for bullion purchases.',
    category: 'Legal & Tax',
    readTime: '10 min',
    icon: '📋',
  },
  {
    slug: 'platinum-palladium',
    title: 'Platinum & Palladium Guide',
    description: 'Explore the lesser-known PGMs: industrial demand, automotive catalysts, investment potential, and supply constraints.',
    category: 'Getting Started',
    readTime: '6 min',
    icon: '⚡',
  },
];

const glossary = [
  { term: 'Spot Price', definition: 'The current market price at which a metal can be bought or sold for immediate delivery.' },
  { term: 'Premium', definition: 'The amount charged above spot price, covering minting, distribution, and dealer margin.' },
  { term: 'Troy Ounce', definition: 'The standard unit for weighing precious metals, equal to 31.1035 grams (heavier than a regular ounce).' },
  { term: 'Fineness / Purity', definition: 'The proportion of pure metal in a product, expressed as a decimal (e.g., .9999 = 99.99% pure).' },
  { term: 'Bullion', definition: 'Precious metals in bulk form (bars, coins, rounds) valued primarily by weight and purity.' },
  { term: 'Numismatic', definition: 'Coins valued for rarity, age, and collectible demand beyond their metal content.' },
  { term: 'DCA', definition: 'Dollar-Cost Averaging: buying a fixed dollar amount at regular intervals regardless of price.' },
  { term: 'Allocated Storage', definition: 'Your specific metals are stored separately and identified as yours, not pooled with others.' },
  { term: 'Spread', definition: 'The difference between the buy (ask) and sell (bid) price of a metal.' },
  { term: 'KYC', definition: 'Know Your Customer: identity verification required by law for certain transaction amounts.' },
];

const categories = [...new Set(guides.map(g => g.category))];

export default function LearnPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Learn</h1>
        <p className="mt-1 text-navy-400">
          Educational guides and resources for precious metals investing.
        </p>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <a
            key={cat}
            href={`#${cat.toLowerCase().replace(/\s+/g, '-')}`}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-navy-800 border border-navy-700 text-navy-300 hover:border-gold-500/30 hover:text-gold-400 transition-colors"
          >
            {cat}
          </a>
        ))}
        <a
          href="#glossary"
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-navy-800 border border-navy-700 text-navy-300 hover:border-gold-500/30 hover:text-gold-400 transition-colors"
        >
          Glossary
        </a>
      </div>

      {/* Guides by Category */}
      {categories.map((category) => (
        <div key={category} id={category.toLowerCase().replace(/\s+/g, '-')}>
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.filter(g => g.category === category).map((guide) => (
              <Link
                key={guide.slug}
                href={`/app/learn/${guide.slug}`}
                className="bg-navy-800 border border-navy-700 rounded-lg p-5 hover:border-gold-500/30 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{guide.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold group-hover:text-gold-400 transition-colors text-sm">
                      {guide.title}
                    </h3>
                    <p className="text-navy-400 text-xs mt-1 line-clamp-2">{guide.description}</p>
                    <p className="text-navy-500 text-xs mt-2">{guide.readTime} read</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Glossary */}
      <div id="glossary">
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Glossary</h2>
        <div className="bg-navy-800 border border-navy-700 rounded-lg divide-y divide-navy-700">
          {glossary.map((item) => (
            <div key={item.term} className="px-5 py-3">
              <dt className="text-white font-medium text-sm">{item.term}</dt>
              <dd className="text-navy-400 text-sm mt-0.5">{item.definition}</dd>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-gold-500/10 to-navy-800 border border-gold-500/20 rounded-lg p-6 text-center">
        <h3 className="text-white font-bold text-lg mb-2">Ready to Start Investing?</h3>
        <p className="text-navy-400 text-sm mb-4">Browse our product catalog and lock in your first trade.</p>
        <Link
          href="/app/market"
          className="inline-block px-6 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold text-sm rounded-lg transition-colors"
        >
          Browse Market
        </Link>
      </div>
    </div>
  );
}
