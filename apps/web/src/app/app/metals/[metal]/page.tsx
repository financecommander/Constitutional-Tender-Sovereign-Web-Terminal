'use client';

import { useParams } from 'next/navigation';
import { useProducts } from '@/hooks/use-products';
import { useSpotStream } from '@/hooks/use-spot-stream';
import { ProductCard } from '@/components/ProductCard';
import { MetalTile } from '@/components/MetalTile';

const METAL_MAP: Record<string, { code: string; label: string }> = {
  gold: { code: 'XAU', label: 'Gold' },
  silver: { code: 'XAG', label: 'Silver' },
  platinum: { code: 'XPT', label: 'Platinum' },
  palladium: { code: 'XPD', label: 'Palladium' },
};

export default function MetalCategoryPage() {
  const params = useParams();
  const metalSlug = (params.metal as string) || '';
  const metalInfo = METAL_MAP[metalSlug.toLowerCase()];
  const metalCode = metalInfo?.code;

  const { data: products, isLoading, error } = useProducts(metalCode);
  const { spots } = useSpotStream();

  const spot = spots.find((s) => s.metal === metalCode);

  if (!metalInfo) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Metal Not Found</h1>
        <p className="text-navy-400">Unknown metal: {metalSlug}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{metalInfo.label} Products</h1>
        <p className="mt-1 text-navy-400">Browse {metalInfo.label.toLowerCase()} coins, bars, and rounds.</p>
      </div>

      {/* Spot Price Tile */}
      {spot && (
        <div className="max-w-xs">
          <MetalTile spot={spot} />
        </div>
      )}

      {/* Product Grid */}
      <div>
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">
          Available Products
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-navy-800 border border-navy-700 rounded-lg p-5 animate-pulse">
                <div className="h-5 w-48 bg-navy-700 rounded mb-3" />
                <div className="h-3 w-32 bg-navy-700 rounded mb-4" />
                <div className="h-6 w-24 bg-navy-700 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
            Failed to load products: {error}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-8 text-center">
            <p className="text-navy-400 text-sm">No {metalInfo.label.toLowerCase()} products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
