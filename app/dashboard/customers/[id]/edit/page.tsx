import Link from 'next/link';
import { notFound } from 'next/navigation';
import CustomerForm from '@/app/ui/customers/form';
import { fetchCustomerById } from '@/app/lib/data';
import { updateCustomer } from '@/app/lib/actions';

export const metadata = {
  title: 'Edit Customer',
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

  const updateCustomerWithId = updateCustomer.bind(null, id);

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
          Edit Customer
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the customer's information below.
        </p>
      </div>

      <div className="max-w-xl rounded-lg border border-gray-200 bg-white p-6">
        <CustomerForm
          customer={customer}
          action={updateCustomerWithId}
        />
      </div>
    </div>
  );
}
