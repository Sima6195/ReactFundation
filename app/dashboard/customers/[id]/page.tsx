import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCustomerById } from '@/app/lib/data';

export const metadata = {
  title: 'Customer Details',
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await fetchCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <main className="w-full">
      <div className="mb-6">
        <Link
          href="/dashboard/customers"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Customers
        </Link>

        <h1 className="mt-4 text-2xl font-bold">
          Customer Details
        </h1>
      </div>

      <div className="max-w-xl rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">{customer.name}</h2>

        <p className="mb-2">
          <strong>Email:</strong> {customer.email}
        </p>

        <p className="mb-6">
          <strong>Customer ID:</strong> {customer.id}
        </p>

        <Link
          href={`/dashboard/customers/${customer.id}/edit`}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Edit Customer
        </Link>
      </div>
    </main>
  );
}
