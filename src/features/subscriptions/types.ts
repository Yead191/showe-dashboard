import type { Subscription } from '@/types';

export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible';

export interface Invoice {
  id: string;
  number: string;
  issued_at: string;
  period_start: string;
  period_end: string;
  amount_pence: number;
  status: InvoiceStatus;
  pdf_url: string;
}

/**
 * Build a deterministic mock invoice history for a subscription so that
 * "View invoices" feels stable across renders.
 */
export function buildMockInvoices(sub: Subscription): Invoice[] {
  const periods = sub.interval === 'annual' ? 1 : 6;
  const monthly = sub.interval === 'annual' ? sub.amount_pence / 12 : sub.amount_pence;
  const start = new Date(sub.current_period_start);

  const invoices: Invoice[] = [];
  for (let i = 0; i < periods; i++) {
    const issued = new Date(start);
    issued.setMonth(issued.getMonth() - i);
    const periodEnd = new Date(issued);
    periodEnd.setMonth(periodEnd.getMonth() + (sub.interval === 'annual' ? 12 : 1));

    const status: InvoiceStatus =
      i === 0 && sub.status === 'past_due'
        ? 'open'
        : sub.status === 'cancelled' && i === 0
          ? 'void'
          : 'paid';

    invoices.push({
      id: `inv_${sub.id}_${String(i + 1).padStart(3, '0')}`,
      number: `${sub.id.toUpperCase()}-${String(periods - i).padStart(4, '0')}`,
      issued_at: issued.toISOString(),
      period_start: issued.toISOString(),
      period_end: periodEnd.toISOString(),
      amount_pence: sub.interval === 'annual' && i === 0 ? sub.amount_pence : monthly,
      status,
      pdf_url: `https://invoices.showe.app/${sub.id}/${i + 1}.pdf`,
    });
  }

  return invoices;
}
