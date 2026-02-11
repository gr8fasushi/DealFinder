"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SignOutPage() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sign Out</h1>
            {user && (
              <p className="text-muted-foreground">
                Currently signed in as: <span className="font-semibold">{user.emailAddresses[0]?.emailAddress}</span>
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleSignOut}
              className="w-full"
              size="lg"
            >
              Sign Out
            </Button>

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            After signing out, you'll need to sign back in to access the admin panel with your updated role.
          </p>
        </div>
      </Card>
    </div>
  );
}
