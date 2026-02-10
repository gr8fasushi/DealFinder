import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { savedDeals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DealGrid } from "@/components/deals/DealGrid";

export default async function SavedDealsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user's saved deals
  const userSavedDeals = await db.query.savedDeals.findMany({
    where: eq(savedDeals.userId, userId),
    with: {
      deal: {
        with: {
          store: true,
          category: true,
        },
      },
    },
    orderBy: (savedDeals, { desc }) => [desc(savedDeals.createdAt)],
  });

  // Extract just the deals
  const deals = userSavedDeals.map((sd) => sd.deal);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Saved Deals
          </h1>
          <p className="text-lg sm:text-xl text-purple-100">
            Your favorite deals, all in one place
          </p>
        </div>
      </div>

      {/* Deals Section */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {deals.length} Saved {deals.length === 1 ? "Deal" : "Deals"}
          </h2>
        </div>

        {deals.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">
              No saved deals yet
            </p>
            <p className="text-muted-foreground">
              Click the heart icon on any deal to save it here!
            </p>
          </div>
        ) : (
          <DealGrid deals={deals} />
        )}
      </div>
    </main>
  );
}
