import { NextResponse, NextRequest } from 'next/server';
import { getTransactions, addTransaction, deleteTransaction, setupDatabase } from '@/lib/db';

// İlk istekte veritabanını kurmayı dene
setupDatabase().catch(err => console.error("Setup failed:", err));

export async function GET() {
  try {
    const data = await getTransactions();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newTx = await addTransaction(body.amount, body.description, body.type, body.category, body.date);
    return NextResponse.json(newTx, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Add failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    await deleteTransaction(id);
    return NextResponse.json({ success: true });
}
