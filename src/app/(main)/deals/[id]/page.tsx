import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronRight } from "lucide-react";
import { YouTubeVideos } from "@/components/deals/YouTubeVideos";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const dealId = parseInt(id);

  if (isNaN(dealId)) {
    return { title: "Deal Not Found" };
  }

  const deal = await db.query.deals.findFirst({
    where: and(eq(deals.id, dealId), eq(deals.isActive, true)),
    with: {
      store: true,
      category: true,
    },
  });

  if (!deal) {
    return { title: "Deal Not Found" };
  }

  const savingsPercent = deal.savingsPercent
    ? Math.round(parseFloat(deal.savingsPercent as string))
    : 0;

  const storeName = (deal.store as { name: string }).name;

  return {
    title: `${deal.title} - ${storeName} Deal | DealFinder`,
    description:
      deal.description ||
      `Get ${savingsPercent}% off on ${deal.title} from ${storeName}`,
    openGraph: {
      title: deal.title,
      description: `Save ${savingsPercent}% on ${deal.title}`,
      images: deal.imageUrl ? [deal.imageUrl] : [],
    },
  };
}

export default async function DealDetailPage({ params }: PageProps) {
  const { id } = await params;
  const dealId = parseInt(id);

  if (isNaN(dealId)) {
    notFound();
  }

  // Fetch deal with relations
  const deal = await db.query.deals.findFirst({
    where: and(eq(deals.id, dealId), eq(deals.isActive, true)),
    with: {
      store: true,
      category: true,
    },
  });

  if (!deal) {
    notFound();
  }

  // Check if user has saved this deal (if authenticated)
  // Note: isSaved functionality can be added to UI later
  await auth();

  // Type assertions for relations
  const store = deal.store as { id: number; name: string; logoUrl: string | null };
  const category = deal.category as { id: number; name: string; slug: string } | null;

  // Calculate savings
  const currentPrice = parseFloat(deal.currentPrice as string);
  const originalPrice = deal.originalPrice
    ? parseFloat(deal.originalPrice as string)
    : null;
  const savingsAmount = deal.savingsAmount
    ? parseFloat(deal.savingsAmount as string)
    : null;
  const savingsPercent = deal.savingsPercent
    ? Math.round(parseFloat(deal.savingsPercent as string))
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          {category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link
                href={`/?category=${category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Deal Details</span>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column: Product Image */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="relative aspect-square w-full bg-white rounded-lg overflow-hidden">
                  {deal.imageUrl ? (
                    <Image
                      src={deal.imageUrl}
                      alt={deal.title}
                      fill
                      unoptimized
                      className="object-contain p-4"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400 text-xl">No Image</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Store Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {store.logoUrl && (
                    <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden border">
                      <Image
                        src={store.logoUrl}
                        alt={store.name}
                        fill
                        unoptimized
                        className="object-contain p-2"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Sold by</p>
                    <p className="text-lg font-semibold">{store.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Deal Info */}
          <div className="space-y-6">
            {/* Savings Badge */}
            {savingsPercent && (
              <Badge className="bg-red-500 text-white text-lg px-4 py-2">
                Save {savingsPercent}%
              </Badge>
            )}

            {/* Title & Brand */}
            <div>
              {deal.brand && (
                <p className="text-sm uppercase tracking-wide text-muted-foreground mb-2">
                  {deal.brand}
                </p>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                {deal.title}
              </h1>
            </div>

            {/* Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  ${currentPrice.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {savingsAmount && (
                <p className="text-lg text-green-600 dark:text-green-400 font-semibold">
                  You save ${savingsAmount.toFixed(2)}
                </p>
              )}
            </div>

            {/* Category */}
            {category && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Category</p>
                <Link href={`/?category=${category.slug}`}>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {category.name}
                  </Badge>
                </Link>
              </div>
            )}

            {/* Description */}
            {deal.description && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {deal.description}
                </p>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-4">
              <Button
                asChild
                size="lg"
                className="w-full text-lg py-6"
              >
                <a
                  href={deal.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View Deal on {store.name}
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* YouTube Videos Section */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Product Reviews
          </h2>
          <YouTubeVideos dealId={dealId} />
        </div>
      </div>
    </main>
  );
}
