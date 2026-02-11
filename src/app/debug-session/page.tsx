import { auth } from "@clerk/nextjs/server";

export default async function DebugSessionPage() {
  const { userId, sessionClaims } = await auth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Session Debug Info</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User ID</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {userId || "Not signed in"}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Claims (Full Object)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(sessionClaims, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Public Metadata</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(sessionClaims?.publicMetadata, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Role Check</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {`Role: ${(sessionClaims?.publicMetadata as { role?: string })?.role || "No role found"}`}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Access Check</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {(sessionClaims?.publicMetadata as { role?: string })?.role === "admin"
              ? "✅ Should have admin access"
              : "❌ No admin access - role is not 'admin'"}
          </pre>
        </div>

        <div className="mt-6">
          <a
            href="/admin"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Admin Panel
          </a>
        </div>
      </div>
    </div>
  );
}
