import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const description = formData.get('description') as string
  const community_id = formData.get('community_id') as string
  const visible_to_all = formData.get('visible_to_all') === 'true'

  if (!file || !name || !community_id) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const admin = createAdminClient()
  const ext = file.name.split('.').pop()
  const path = `${community_id}/${Date.now()}_${name.replace(/\s+/g, '_')}.${ext}`

  // Subir archivo a Storage
  const arrayBuffer = await file.arrayBuffer()
  const { error: storageError } = await admin.storage
    .from('documentos')
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false })

  if (storageError) return NextResponse.json({ error: storageError.message }, { status: 400 })

  // Obtener URL firmada (válida 1 año)
  const { data: urlData } = await admin.storage
    .from('documentos')
    .createSignedUrl(path, 60 * 60 * 24 * 365)

  // Guardar en BD
  const { data, error } = await (admin.from('documents') as any).insert({
    community_id,
    uploaded_by: user.id,
    name,
    description: description || null,
    type: type || 'other',
    file_url: path,
    file_size_bytes: file.size,
    mime_type: file.type,
    visible_to_all,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true, data, signed_url: urlData?.signedUrl })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id, file_url } = await request.json()
  const admin = createAdminClient()

  // Borrar de Storage
  if (file_url) {
    await admin.storage.from('documentos').remove([file_url])
  }

  const { error } = await (admin.from('documents') as any).delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  if (!path) return NextResponse.json({ error: 'Falta path' }, { status: 400 })

  const admin = createAdminClient()
  const { data } = await admin.storage
    .from('documentos')
    .createSignedUrl(path, 60 * 60) // 1 hora

  return NextResponse.json({ url: data?.signedUrl })
}
