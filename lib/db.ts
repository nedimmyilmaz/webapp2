import { sql } from '@vercel/postgres';

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

export async function setupDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount NUMERIC NOT NULL,
        description VARCHAR(255) NOT NULL,
        type VARCHAR(10) NOT NULL,
        category VARCHAR(50) NOT NULL,
        date DATE NOT NULL
      );
    `;
  } catch (error) {
    throw new Error(`DB Setup Error: ${getErrorMessage(error)}`);
  }
}

export async function addTransaction(amount: number, description: string, type: string, category: string, date: string) {
  try {
    const result = await sql`
      INSERT INTO transactions (amount, description, type, category, date)
      VALUES (${amount}, ${description}, ${type}, ${category}, ${date})
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    throw new Error(`Add Error: ${getErrorMessage(error)}`);
  }
}

export async function getTransactions() {
  try {
    const result = await sql`SELECT * FROM transactions ORDER BY date DESC, id DESC`;
    return result.rows;
  } catch (error) {
    // Tablo yoksa boş dön
    return [];
  }
}

export async function deleteTransaction(id: string) {
    try {
        await sql`DELETE FROM transactions WHERE id = ${id}`;
        return true;
    } catch (error) {
        throw new Error(`Delete Error: ${getErrorMessage(error)}`);
    }
}
