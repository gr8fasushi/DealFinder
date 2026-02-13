"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Loader2, RefreshCw } from "lucide-react";

interface ScraperLog {
  id: number;
  source: string;
  status: string;
  dealsFound: number;
  dealsAdded: number;
  dealsUpdated: number;
  errorMessage: string | null;
  duration: number;
  startedAt: string;
}

interface RunResult {
  success: boolean;
  totalFound: number;
  totalAdded: number;
  totalUpdated: number;
  totalExpired: number;
  results: {
    source: string;
    status: string;
    deals: unknown[];
    error?: string;
    duration: number;
  }[];
}

const SOURCES = [
  { id: "walmart", label: "Walmart" },
  { id: "newegg", label: "Newegg" },
  { id: "amazon", label: "Amazon (API only)" },
] as const;

export function ScraperPanel() {
  const [selectedSources, setSelectedSources] = useState<string[]>([
    "walmart",
    "newegg",
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<RunResult | null>(null);
  const [logs, setLogs] = useState<ScraperLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await fetch("/api/admin/scraper/logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleRun = async () => {
    if (selectedSources.length === 0) return;

    setIsRunning(true);
    setLastResult(null);

    try {
      const response = await fetch("/api/admin/scraper/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: selectedSources }),
      });

      if (response.ok) {
        const data: RunResult = await response.json();
        setLastResult(data);
        fetchLogs(); // Refresh logs
      } else {
        let message = "Failed to run scraper";
        try {
          const errorData = await response.json();
          message = errorData.error || message;
        } catch {
          // not JSON
        }
        setLastResult({
          success: false,
          totalFound: 0,
          totalAdded: 0,
          totalUpdated: 0,
          totalExpired: 0,
          results: [
            {
              source: "all",
              status: "failed",
              deals: [],
              error: message,
              duration: 0,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error running scraper:", error);
      setLastResult({
        success: false,
        totalFound: 0,
        totalAdded: 0,
        totalUpdated: 0,
        totalExpired: 0,
        results: [
          {
            source: "all",
            status: "failed",
            deals: [],
            error: "Network error",
            duration: 0,
          },
        ],
      });
    } finally {
      setIsRunning(false);
    }
  };

  const toggleSource = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "success":
        return "default" as const;
      case "partial":
        return "secondary" as const;
      case "failed":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <div className="space-y-4">
      {/* Run Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Web Scraper
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Source Selection */}
          <div>
            <p className="text-sm font-medium mb-2">Select sources:</p>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map((source) => (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  disabled={isRunning}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                    selectedSources.includes(source.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-input hover:bg-accent"
                  } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {source.label}
                </button>
              ))}
            </div>
          </div>

          {/* Run Button */}
          <Button
            onClick={handleRun}
            disabled={isRunning || selectedSources.length === 0}
            className="w-full sm:w-auto"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Scraper
              </>
            )}
          </Button>

          {/* Last Result */}
          {lastResult && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">
                {lastResult.success ? "Scrape Complete" : "Scrape Failed"}
              </h4>
              {lastResult.success && (
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {lastResult.totalFound}
                    </div>
                    <div className="text-xs text-muted-foreground">Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {lastResult.totalAdded}
                    </div>
                    <div className="text-xs text-muted-foreground">Added</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {lastResult.totalUpdated}
                    </div>
                    <div className="text-xs text-muted-foreground">Updated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {lastResult.totalExpired}
                    </div>
                    <div className="text-xs text-muted-foreground">Expired</div>
                  </div>
                </div>
              )}
              {lastResult.results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1 text-sm"
                >
                  <span className="capitalize">{r.source}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadgeVariant(r.status)}>
                      {r.status}
                    </Badge>
                    {r.error && (
                      <span className="text-xs text-destructive max-w-[200px] truncate">
                        {r.error}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {r.deals.length} deals | {(r.duration / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Scraper Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No scraper runs yet. Click &quot;Run Scraper&quot; to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Source</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Found</th>
                    <th className="pb-2 font-medium">Added</th>
                    <th className="pb-2 font-medium">Updated</th>
                    <th className="pb-2 font-medium">Duration</th>
                    <th className="pb-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-2 capitalize">{log.source}</td>
                      <td className="py-2">
                        <Badge variant={statusBadgeVariant(log.status)}>
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-2">{log.dealsFound}</td>
                      <td className="py-2">{log.dealsAdded}</td>
                      <td className="py-2">{log.dealsUpdated}</td>
                      <td className="py-2">
                        {log.duration ? `${(log.duration / 1000).toFixed(1)}s` : "-"}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(log.startedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
