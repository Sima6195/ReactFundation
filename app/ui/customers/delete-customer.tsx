'use client';

import { deleteCustomer } from '@/app/lib/actions';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function DeleteCustomer({ id }: { id: string }) {
  const deleteCustomerWithId = deleteCustomer.bind(null, id);

  return (
    <form action={deleteCustomerWithId}>
      <button
        type="submit"
        title="Delete customer"
        aria-label="Delete customer"
        onClick={(event) => {
          if (!confirm('Are you sure you want to delete this customer?')) {
            event.preventDefault();
          }
        }}
        className="rounded-md border p-2 hover:bg-gray-100"
      >
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}