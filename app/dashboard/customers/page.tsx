
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

import Search from '@/app/ui/search';
import Pagination from '@/app/ui/invoices/pagination';
import DeleteCustomer from '@/app/ui/customers/delete-customer';

import {
  fetchFilteredCustomers,
  fetchCustomersPages,
} from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Customers | Acme Dashboard',
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    error?: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const error = searchParams?.error;

  const [customers, totalPages] = await Promise.all([
    fetchFilteredCustomers(query, currentPage),
    fetchCustomersPages(query),
  ]);

  return (
    <div className="w-full">

      {/* Heading */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customers
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create, view, edit and manage your customers.
          </p>
        </div>

        <Link
          href="/dashboard/customers/create"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Customer
        </Link>
      </div>

      {/* Delete warning */}
      {error === 'has-invoices' && (
        <div className="mb-5 rounded-md border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
          This customer cannot be deleted because they have
          existing invoices. Please handle their invoices first.
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <Search placeholder="Search customers..." />
      </div>

      {/* Customer table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">

        <table className="w-full text-left text-sm">

          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Name
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Email
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Invoices
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Paid
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Pending
              </th>

              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-gray-50"
              >

                {/* Customer name */}
                <td className="px-4 py-3 font-medium text-gray-900">
                  <div className="flex items-center gap-3">

                    {customer.image_url ? (
                      <Image
                        src={customer.image_url}
                        alt={`${customer.name}'s profile picture`}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <span>{customer.name}</span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-4 py-3 text-gray-600">
                  {customer.email}
                </td>

                {/* Invoices */}
                <td className="px-4 py-3 text-gray-600">
                  {customer.total_invoices}
                </td>

                {/* Paid */}
                <td className="px-4 py-3 text-green-600">
                  {customer.total_paid}
                </td>

                {/* Pending */}
                <td className="px-4 py-3 text-orange-500">
                  {customer.total_pending}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">

                    <Link
                      href={`/dashboard/customers/${customer.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      View
                    </Link>

                    <Link
                      href={`/dashboard/customers/${customer.id}/edit`}
                      className="font-medium text-green-600 hover:underline"
                    >
                      Edit
                    </Link>

                    <DeleteCustomer id={customer.id} />

                  </div>
                </td>

              </tr>
            ))}

          </tbody>
        </table>

        {customers.length === 0 && (
          <p className="p-6 text-center text-gray-500">
            No customers found.
          </p>
        )}

      </div>

      {/* Pagination */}
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>

    </div>
  );
}
