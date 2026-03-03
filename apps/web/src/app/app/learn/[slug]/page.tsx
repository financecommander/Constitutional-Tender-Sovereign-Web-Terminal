'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

// In-app educational articles
const articles: Record<string, { title: string; content: string[] }> = {
  'why-precious-metals': {
    title: 'Why Invest in Precious Metals?',
    content: [
      'Precious metals have served as stores of value for over 5,000 years. Gold, silver, platinum, and palladium each offer unique investment characteristics that can strengthen a diversified portfolio.',
      'Unlike paper currencies, precious metals cannot be printed or created out of thin air. Their supply is limited by what can be mined from the earth, which makes them naturally resistant to inflationary monetary policies.',
      'Gold in particular has historically maintained its purchasing power over centuries. An ounce of gold today buys roughly the same amount of goods it did 100 years ago, while the US dollar has lost over 96% of its purchasing power in the same period.',
      'Precious metals also serve as portfolio insurance. During financial crises, stock market crashes, and geopolitical uncertainty, gold and silver tend to hold their value or even appreciate while other assets decline.',
      'For investors looking to diversify beyond stocks, bonds, and real estate, precious metals offer a truly uncorrelated asset class. They don\'t depend on any company\'s earnings, any government\'s fiscal health, or any bank\'s solvency.',
      'Modern precious metals investing is easier than ever. You can buy fractional amounts, set up automatic recurring purchases, and choose between taking physical delivery or using allocated vault storage.',
    ],
  },
  'gold-vs-silver': {
    title: 'Gold vs Silver: Which Is Right for You?',
    content: [
      'Gold and silver are the two most popular precious metals for investment, but they have very different characteristics that suit different investor profiles.',
      'Gold is the premier store of value. It\'s more expensive per ounce, less volatile, and more widely recognized as a monetary metal. Central banks around the world hold gold reserves, lending it institutional credibility that no other metal matches.',
      'Silver, on the other hand, offers a lower entry point and greater potential for percentage gains. Silver\'s price is more volatile than gold, meaning it can move sharply in both directions. This makes it attractive for investors who believe precious metals prices will rise significantly.',
      'The gold-to-silver ratio (how many ounces of silver it takes to buy one ounce of gold) has historically averaged around 60:1, but it fluctuates widely. When the ratio is high (above 80:1), silver may be undervalued relative to gold. When it\'s low (below 50:1), gold may offer better relative value.',
      'Silver has significant industrial demand (electronics, solar panels, medical devices) which adds a growth component to its investment thesis. Gold\'s industrial use is minimal—its value is almost entirely monetary and ornamental.',
      'Many investors choose to hold both metals. A common approach is to hold gold as a core position (5-15% of a portfolio) and silver as a smaller, more speculative allocation.',
    ],
  },
  'understanding-spot-price': {
    title: 'Understanding the Spot Price',
    content: [
      'The spot price is the current market price at which a precious metal can be bought or sold for immediate delivery. It\'s the baseline price from which all precious metals products are priced.',
      'Spot prices are determined by global commodities markets, primarily the COMEX (part of CME Group) in New York and the London Bullion Market Association (LBMA) in London. These prices reflect real-time supply and demand dynamics.',
      'When you buy physical precious metals, you\'ll always pay a price above spot. This additional cost is called the "premium" and covers the costs of mining, refining, minting, distribution, and the dealer\'s margin.',
      'Spot prices change constantly during market hours. Our platform streams live spot prices so you can always see the current market rate. When you lock a quote, the spot price at that moment is frozen for the duration of your price lock window.',
      'Factors that influence spot prices include: monetary policy (interest rates, quantitative easing), inflation expectations, currency movements (especially the US dollar), geopolitical events, and physical supply/demand dynamics.',
      'It\'s important to note that "spot price" refers to the price of pure, unprocessed metal. The premium you pay above spot is not a hidden fee—it\'s the real cost of turning raw metal into the finished product you receive.',
    ],
  },
  'premiums-spreads-explained': {
    title: 'Premiums & Spreads Explained',
    content: [
      'Understanding premiums and spreads is essential for smart precious metals buying. These concepts determine the true cost of your investment and affect your break-even point.',
      'The premium is the amount you pay above the spot price. It\'s expressed either as a dollar amount per ounce or as a percentage over spot. For example, if gold spot is $2,000/oz and you pay $2,060, your premium is $60/oz or 3% over spot.',
      'Premiums vary widely based on product type. Government-minted coins (like American Eagles) carry higher premiums due to their legal tender status, recognizability, and collectible demand. Generic bars and rounds from private mints typically have lower premiums.',
      'The spread is the difference between the buy (ask) price and the sell (bid) price. When you buy, you pay the ask price. When you sell back, you receive the bid price. The spread represents the dealer\'s profit margin on the round trip.',
      'Lower premiums and tighter spreads mean you need less price appreciation to break even on your investment. For pure investment purposes, products with the lowest premiums over spot generally offer the best value.',
      'Premiums can fluctuate significantly based on market conditions. During periods of high demand (financial crises, inflation fears), premiums can spike dramatically as physical supply becomes constrained. Planning ahead with dollar-cost averaging can help you avoid buying at peak premiums.',
      'On our platform, we show you the complete price breakdown: spot price + premium + spread. You always know exactly what you\'re paying and why.',
    ],
  },
  'dollar-cost-averaging': {
    title: 'Dollar-Cost Averaging (DCA) Strategy',
    content: [
      'Dollar-cost averaging (DCA) is an investment strategy where you invest a fixed dollar amount at regular intervals, regardless of the current price. This approach removes the emotion and guesswork from timing the market.',
      'Here\'s how it works: instead of trying to invest $6,000 at the "perfect" time, you invest $500 per month for 12 months. Some months you\'ll buy when prices are high (getting fewer ounces), and some months when prices are low (getting more ounces). Over time, this averages out to a favorable overall cost.',
      'DCA is particularly effective for precious metals because spot prices can be volatile in the short term. By spreading your purchases over time, you reduce the risk of buying a large position right before a price decline.',
      'The math works in your favor: when prices are low, your fixed dollar amount buys more ounces. When prices are high, you buy fewer ounces. This naturally weights your purchases toward lower prices, resulting in an average cost per ounce that\'s lower than the average market price over the same period.',
      'Our Savings Plans feature automates DCA for you. Set your product, amount, and frequency (weekly, bi-weekly, or monthly), and we\'ll execute purchases automatically at the best available price on each schedule.',
      'DCA works best when you\'re investing for the long term and believe in the fundamental value proposition of precious metals. It removes the stress of market timing and builds your position steadily over time.',
    ],
  },
  'coins-bars-rounds': {
    title: 'Coins, Bars & Rounds: What to Buy',
    content: [
      'Physical precious metals come in three main forms: coins, bars, and rounds. Each has distinct advantages depending on your investment goals.',
      'Government-minted coins (like American Gold Eagles, Canadian Maple Leafs, and Austrian Philharmonics) are the most recognizable and liquid form of bullion. They carry legal tender status, have guaranteed weight and purity backed by a sovereign government, and are widely recognized worldwide. The tradeoff is higher premiums.',
      'Bars range from small 1-gram pieces to massive 400-oz institutional bars. They typically carry lower premiums than coins because they\'re simpler to produce. Bars from reputable refineries (PAMP Suisse, Valcambi, Royal Canadian Mint) are easily traded and widely accepted.',
      'Rounds are coin-shaped bullion produced by private mints. They look like coins but don\'t carry legal tender status. Rounds typically have the lowest premiums of the three forms, making them ideal for investors focused purely on metal content rather than collectibility.',
      'For most investors, a mix of coins and bars offers the best balance of liquidity, recognizability, and value. Government coins are easy to sell anywhere in the world, while bars offer more metal per dollar spent.',
      'Consider your goals: if you want maximum metal for your money, choose bars and rounds. If you want maximum liquidity and ease of resale, choose government coins. If you\'re a collector, numismatic coins may appeal but that\'s a different investment thesis.',
    ],
  },
  'storage-options': {
    title: 'Storing Your Precious Metals Safely',
    content: [
      'Once you own physical precious metals, you need a plan for secure storage. There are three main options, each with different tradeoffs between accessibility, security, and cost.',
      'Home storage gives you immediate access to your metals. A quality home safe (fire-rated, bolted down) is the minimum requirement. Consider a safe rated for at least 1 hour of fire protection. Never tell anyone about your metals or your safe\'s location. Home insurance may or may not cover precious metals—check your policy.',
      'Bank safe deposit boxes offer institutional-level security but come with limitations. They\'re only accessible during bank hours, may not be insured against bank failure, and can be frozen during legal disputes. Costs run $50-$300/year depending on box size.',
      'Professional vault storage (allocated storage) offers the highest level of security. Your metals are stored in a fully insured, audited vault facility, segregated and identified as yours. You can request physical delivery at any time. Annual storage fees typically run 0.5-1% of the metals\' value.',
      'For larger holdings, many investors split their storage across multiple locations and methods. This reduces concentration risk—no single event (theft, fire, bank failure) can wipe out your entire position.',
      'Important: always take delivery or verify allocated storage. "Paper gold" products (unallocated accounts, ETFs) don\'t give you ownership of specific physical metal. The whole point of precious metals investing is owning the actual metal.',
    ],
  },
  'tax-implications': {
    title: 'Tax Implications of Precious Metals',
    content: [
      'Disclaimer: This is general educational information, not tax advice. Consult a qualified tax professional for guidance specific to your situation.',
      'In the United States, the IRS classifies precious metals as collectibles. This means long-term capital gains (held over 1 year) are taxed at a maximum rate of 28%, rather than the lower 15-20% rate that applies to stocks and bonds.',
      'Short-term capital gains (held under 1 year) are taxed as ordinary income, just like any other short-term investment gain.',
      'When you sell precious metals, your dealer is required to report certain transactions to the IRS via Form 1099-B. The reporting requirements depend on the type and quantity of metal sold. Not all sales trigger reporting, but all gains are taxable regardless of reporting.',
      'Many U.S. states exempt precious metals from sales tax. The rules vary significantly by state—some exempt all bullion, some only exempt purchases above a certain dollar threshold, and some tax all precious metals sales. Check your state\'s specific rules.',
      'Some investors use Precious Metals IRAs (Self-Directed IRAs) to hold physical gold and silver in a tax-advantaged retirement account. These accounts have specific rules about which products qualify (generally, coins and bars of certain purity levels) and require an approved custodian and depository.',
      'Record keeping is essential. Track your purchase price (cost basis), purchase date, and sale price for every transaction. This information is needed to accurately calculate your capital gains or losses.',
    ],
  },
  'platinum-palladium': {
    title: 'Platinum & Palladium Guide',
    content: [
      'While gold and silver get most of the attention, platinum and palladium are important precious metals with unique investment characteristics driven largely by industrial demand.',
      'Platinum (Pt) is rarer than gold in the earth\'s crust and has been historically more expensive, though it currently trades at a significant discount to gold. This "platinum discount" is unusual historically and some investors see it as a value opportunity.',
      'Platinum\'s primary industrial use is in automotive catalytic converters (especially diesel vehicles), jewelry, and various industrial processes. About 70% of platinum demand comes from industrial applications, making its price sensitive to economic activity and automotive industry trends.',
      'Palladium (Pd) is even rarer than platinum and is primarily used in gasoline vehicle catalytic converters. The shift from diesel to gasoline vehicles has boosted palladium demand significantly. Supply is concentrated in Russia and South Africa, creating geopolitical supply risk.',
      'Both metals are members of the Platinum Group Metals (PGMs) and share some characteristics: extremely high melting points, excellent catalytic properties, and relatively scarce supply. New demand from hydrogen fuel cell technology could significantly boost PGM demand in coming decades.',
      'PGMs tend to be more volatile than gold and silver due to smaller markets and concentrated supply chains. They\'re generally considered more speculative investments. For most investors, they work best as a small diversifying position alongside core gold and silver holdings.',
    ],
  },
};

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const article = articles[slug];

  if (!article) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Article Not Found</h1>
        <p className="text-navy-400">This guide doesn't exist yet.</p>
        <Link href="/app/learn" className="text-gold-400 hover:text-gold-300 text-sm">
          Back to Learn
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-navy-400">
        <Link href="/app/learn" className="hover:text-white transition-colors">Learn</Link>
        <span>/</span>
        <span className="text-white truncate">{article.title}</span>
      </div>

      <h1 className="text-3xl font-bold text-white tracking-tight">{article.title}</h1>

      <div className="space-y-4">
        {article.content.map((paragraph, i) => (
          <p key={i} className="text-navy-300 leading-relaxed text-[15px]">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Navigation */}
      <div className="border-t border-navy-700 pt-6 mt-8 flex items-center justify-between">
        <Link
          href="/app/learn"
          className="text-gold-400 hover:text-gold-300 text-sm flex items-center gap-1"
        >
          ← All Guides
        </Link>
        <Link
          href="/app/market"
          className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold text-sm rounded-lg transition-colors"
        >
          Start Trading
        </Link>
      </div>
    </div>
  );
}
