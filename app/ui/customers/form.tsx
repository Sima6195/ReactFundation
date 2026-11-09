
'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import {
  createCustomer,
  type CustomerState,
} from '@/app/lib/actions';

type Customer = {
  id: string;
  name: string;
  email: string;
};

export default function CustomerForm({
  customer,
  action,
}: {
  customer?: Customer;
  action?: (
    state: CustomerState,
    formData: FormData,
  ) => Promise<CustomerState>;
}) {
  const initialState: CustomerState = {
    message: null,
    errors: {},
  };

  const formAction = action || createCustomer;

  const [state, dispatch, pending] = useActionState(
    formAction,
    initialState,
  );

  return (
    <form action={dispatch} className="space-y-5">

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium"
        >
          Customer Name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          defaultValue={customer?.name || ''}
          placeholder="Enter customer name"
          required
          className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-blue-500"
        />

        {state.errors?.name && (
          <p className="mt-1 text-sm text-red-500">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium"
        >
          Email Address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          defaultValue={customer?.email || ''}
          placeholder="Enter customer email"
          required
          className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-blue-500"
        />

        {state.errors?.email && (
          <p className="mt-1 text-sm text-red-500">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      {state.message && (
        <p className="text-sm text-red-500">
          {state.message}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending
            ? 'Saving...'
            : customer
              ? 'Update Customer'
              : 'Create Customer'}
        </button>

        <Link
          href="/dashboard/customers"
          className="rounded-md bg-gray-100 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
