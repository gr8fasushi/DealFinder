export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          DealFinder
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Find the best deals from top retailers
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-lg">
          <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full mr-2"></div>
          <p className="text-sm font-medium">Setup in progress...</p>
        </div>
      </div>
    </main>
  );
}
