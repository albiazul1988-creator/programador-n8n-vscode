import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { fee_payment_id } = await request.json()
  if (!fee_payment_id) return NextResponse.json({ error: 'Falta fee_payment_id' }, { status: 400 })

  const admin = createAdminClient()

  // Obtener el pago y sus datos
  const { data: payment } = await (admin.from('fee_payments') as any)
    .select('id, amount, status, period, member_id, fee:fees(name)')
    .eq('id', fee_payment_id)
    .single()

  if (!payment) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
  if (payment.status === 'paid') return NextResponse.json({ error: 'Ya está pagado' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: payment.fee?.name ?? 'Cuota de comunidad',
            description: payment.period ? `Período: ${payment.period}` : undefined,
          },
          unit_amount: Math.round(payment.amount * 100), // céntimos
        },
        quantity: 1,
      },
    ],
    metadata: {
      fee_payment_id: payment.id,
      member_id: payment.member_id,
    },
    success_url: `${appUrl}/vecino/pagos?paid=true`,
    cancel_url: `${appUrl}/vecino/pagos`,
  })

  return NextResponse.json({ url: session.url })
}
