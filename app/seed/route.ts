
import bcrypt from 'bcrypt';
import postgres from 'postgres';
import {
  invoices,
  customers,
  revenue,
  users,
} from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
  prepare: false,
});

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await sql`
      INSERT INTO users (id, name, email, password)
      VALUES (
        ${user.id},
        ${user.name},
        ${user.email},
        ${hashedPassword}
      )
      ON CONFLICT (id) DO NOTHING;
    `;
  }
}

async function seedCustomers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  for (const customer of customers) {
    await sql`
      INSERT INTO customers (id, name, email, image_url)
      VALUES (
        ${customer.id},
        ${customer.name},
        ${customer.email},
        ${customer.image_url}
      )
      ON CONFLICT (id) DO NOTHING;
    `;
  }
}

async function seedInvoices() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  // STEP 1: Remove existing duplicate invoices.
  // Keep one record for each identical customer, amount, status and date.

  await sql`
    WITH ranked_invoices AS (
      SELECT
        id,
        ROW_NUMBER() OVER (
          PARTITION BY customer_id, amount, status, date
          ORDER BY id
        ) AS row_number
      FROM invoices
    )
    DELETE FROM invoices
    WHERE id IN (
      SELECT id
      FROM ranked_invoices
      WHERE row_number > 1
    );
  `;

  // STEP 2: Prevent identical invoices from being inserted again.

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS invoices_no_duplicates
    ON invoices (customer_id, amount, status, date);
  `;

  // STEP 3: Insert only invoices that do not already exist.

  for (const invoice of invoices) {
    await sql`
      INSERT INTO invoices (
        customer_id,
        amount,
        status,
        date
      )
      VALUES (
        ${invoice.customer_id},
        ${invoice.amount},
        ${invoice.status},
        ${invoice.date}
      )
      ON CONFLICT (customer_id, amount, status, date)
      DO NOTHING;
    `;
  }
}

async function seedRevenue() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  for (const rev of revenue) {
    await sql`
      INSERT INTO revenue (month, revenue)
      VALUES (${rev.month}, ${rev.revenue})
      ON CONFLICT (month) DO NOTHING;
    `;
  }
}

export async function GET() {
  try {
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();

    return Response.json({
      message: 'Database seeded successfully. Duplicate invoices removed.',
    });
  } catch (error) {
    console.error('Database seeding failed:', error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred while seeding the database',
      },
      { status: 500 },
    );
  }
}
