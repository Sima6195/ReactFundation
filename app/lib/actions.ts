'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';


const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// State type for form validation
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

// Authenticate user during login
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }

    throw error;
  }
}

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

// Schemas for creating and updating invoices
const CreateInvoice = FormSchema.omit({ id: true, date: true });

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// Create Invoice with server-side validation
export async function createInvoice(
  prevState: State,
  formData: FormData,
): Promise<State> {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // Return validation errors if fields are invalid
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for database insertion
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert invoice into database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.error('Database Error:', error);

    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// Update Invoice
export async function updateInvoice(id: string, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // Return validation errors if fields are invalid
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  // Prepare data for database update
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  // Update invoice in database
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId},
          amount = ${amountInCents},
          status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);

    return {
      message: 'Database Error: Failed to Update Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// Delete Invoice
export async function deleteInvoice(id: string) {
  try {
    await sql`
      DELETE FROM invoices
      WHERE id = ${id}
    `;

    revalidatePath('/dashboard/invoices');
  } catch (error) {
    console.error('Database Error:', error);

    throw new Error('Failed to Delete Invoice.');
  }
}
// DELETE CUSTOMER
export async function deleteCustomer(id: string) {
  try {
    const result = await sql`
      SELECT COUNT(*) AS count
      FROM invoices
      WHERE customer_id = ${id}
    `;

    if (Number(result[0].count) > 0) {
      throw new Error(
        'This customer has invoices and cannot be deleted.',
      );
    }

    await sql`
      DELETE FROM customers
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Failed to delete customer:', error);
    throw error;
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}
