import { DealForm } from "@/components/admin/DealForm";

export default function NewDealPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Deal</h1>
        <p className="text-gray-600 mt-2">
          Create a new deal to display on your platform
        </p>
      </div>

      <DealForm mode="create" />
    </div>
  );
}
