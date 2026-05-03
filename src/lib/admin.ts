// Klient-helpers för admin-betalverktyget.
//
// All känslig logik (Stripe-anrop, mejlskick) ligger i Supabase Edge Functions.
// Klienten gör bara DB-läsning + RPC-anrop med användarens session-token,
// vilket gör att RLS kan kontrollera admin-rollen.

import { supabase } from '@/lib/supabase';
import type { TemplateKey } from '@/lib/emailTemplates';

export interface ReferenceLookup {
  source: 'order' | 'seller';
  reference_id: string;
  recipient_name: string | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  group_name: string | null;
  total_shirts: number | null;
  estimated_revenue: number | null;
  estimated_profit: number | null;
}

export interface PaymentLink {
  id: string;
  reference_id: string;
  recipient_email: string;
  recipient_name: string | null;
  amount_sek: number;
  description: string | null;
  stripe_session_id: string | null;
  stripe_url: string | null;
  status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed';
  paid_at: string | null;
  created_at: string;
}

export interface EmailLogRow {
  id: string;
  template: TemplateKey;
  reference_id: string | null;
  recipient_email: string;
  recipient_name: string | null;
  subject: string | null;
  status: 'queued' | 'sent' | 'failed';
  error: string | null;
  sent_at: string | null;
  created_at: string;
}

export async function isAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) {
    console.warn('[admin] is_admin failed', error);
    return false;
  }
  return data === true;
}

export async function lookupReference(ref: string): Promise<ReferenceLookup | null> {
  const trimmed = ref.trim();
  if (!trimmed) return null;
  const { data, error } = await supabase.rpc('lookup_reference', { ref: trimmed });
  if (error) {
    console.warn('[admin] lookup_reference failed', error);
    return null;
  }
  const rows = (data as ReferenceLookup[] | null) ?? [];
  return rows[0] ?? null;
}

export interface CreatePaymentLinkInput {
  reference_id: string;
  recipient_email: string;
  recipient_name?: string;
  recipient_phone?: string;
  amount_sek: number;
  description?: string;
  group_name?: string;
  send_email?: boolean;
}

export interface CreatePaymentLinkResult {
  payment_link: PaymentLink;
  stripe_url: string;
  email_sent: boolean;
}

export async function createPaymentLink(
  input: CreatePaymentLinkInput,
): Promise<CreatePaymentLinkResult> {
  const { data, error } = await supabase.functions.invoke<CreatePaymentLinkResult>(
    'create-payment-link',
    { body: input },
  );
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Tomt svar från create-payment-link');
  return data;
}

export interface SendConfirmationInput {
  reference_id: string;
  recipient_email: string;
  recipient_name?: string;
  amount_sek: number;
  group_name?: string;
  paid_at?: string;
  payment_link_id?: string;
}

export interface SendConfirmationResult {
  email_sent: boolean;
  email_log_id: string;
}

export async function sendPaymentConfirmation(
  input: SendConfirmationInput,
): Promise<SendConfirmationResult> {
  const { data, error } = await supabase.functions.invoke<SendConfirmationResult>(
    'send-payment-confirmation',
    { body: input },
  );
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Tomt svar från send-payment-confirmation');
  return data;
}

export async function listRecentPaymentLinks(limit = 20): Promise<PaymentLink[]> {
  const { data, error } = await supabase
    .from('payment_links')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[admin] listRecentPaymentLinks failed', error);
    return [];
  }
  return (data as PaymentLink[]) ?? [];
}

export async function listRecentEmails(limit = 20): Promise<EmailLogRow[]> {
  const { data, error } = await supabase
    .from('email_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[admin] listRecentEmails failed', error);
    return [];
  }
  return (data as EmailLogRow[]) ?? [];
}
