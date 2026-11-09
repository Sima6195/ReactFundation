
import Link from 'next/link';
import CustomerForm from '@/app/ui/customers/form';

export const metadata = {
  title: 'Create Customer',
};

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <Link
          href="/dashboard/customers"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Customers
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Add New Customer
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Enter the customer's information below.
        </p>
      </div>

      <div className="max-w-xl rounded-lg border border-gray-200 bg-white p-6">
        <CustomerForm />
      </div>
    </div>
  );
}
