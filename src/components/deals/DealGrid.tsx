import { DealCard } from "./DealCard";

interface Deal {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  currentPrice: string;
  originalPrice: string | null;
  savingsAmount: string | null;
  savingsPercent: string | null;
  affiliateUrl: string;
  brand: string | null;
  store: {
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}

interface DealGridProps {
  deals: Deal[];
}

export function DealGrid({ deals }: DealGridProps) {
  if (deals.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-muted-foreground">No deals found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Check back later for amazing deals!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
}
