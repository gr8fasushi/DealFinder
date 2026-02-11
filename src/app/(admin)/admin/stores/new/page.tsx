import { StoreForm } from "@/components/admin/StoreForm";

export default function NewStorePage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Store</h1>
        <p className="text-gray-600 mt-2">
          Create a new store to associate with deals
        </p>
      </div>

      <StoreForm mode="create" />
    </div>
  );
}
