import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isAdminRoute = pathname.startsWith('/admin')
  const isVecinoRoute = pathname.startsWith('/vecino')
  const isDashboardRoute = isAdminRoute || isVecinoRoute

  // Not logged in → send to login
  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const role = user.user_metadata?.role ?? 'neighbor'
    const isNeighbor = role === 'neighbor'

    // Logged-in user on auth page → send to their panel
    if (isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = isNeighbor ? '/vecino' : '/admin'
      return NextResponse.redirect(url)
    }

    // Neighbor trying to access /admin → redirect to /vecino
    if (isNeighbor && isAdminRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/vecino'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
