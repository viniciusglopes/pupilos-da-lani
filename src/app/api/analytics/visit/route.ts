import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'

function getClientIp(request: NextRequest): string {
  // Try various headers for client IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const clientIp = request.headers.get('x-client-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  if (clientIp) {
    return clientIp
  }
  
  // Fallback to connection remote address
  return request.ip || 'unknown'
}

function hashIp(ip: string): string {
  // Simple hash for IP anonymization (optional)
  // In production, consider using crypto.createHash
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString()
}

// POST /api/analytics/visit
export async function POST(request: NextRequest) {
  try {
    const { page_path, referrer } = await request.json()

    if (!page_path) {
      return NextResponse.json(
        { success: false, error: 'page_path é obrigatório' },
        { status: 400 }
      )
    }

    // Get client information
    const userAgent = request.headers.get('user-agent') || ''
    const visitorIp = getClientIp(request)
    const hashedIp = hashIp(visitorIp) // Use hashed IP for privacy
    const today = new Date().toISOString().split('T')[0]

    // Use UPSERT to increment visit count for today
    const { data, error } = await supabase
      .from('site_analytics')
      .upsert(
        {
          visit_date: today,
          page_path: page_path,
          user_ip: hashedIp, // Store hashed IP for privacy
          user_agent: userAgent,
          referrer: referrer || null,
          visit_count: 1
        },
        {
          onConflict: 'visit_date,page_path,user_ip',
          ignoreDuplicates: false
        }
      )
      .select()

    if (error) {
      // If upsert failed, try to increment existing record
      const { data: existingData, error: selectError } = await supabase
        .from('site_analytics')
        .select('visit_count')
        .eq('visit_date', today)
        .eq('page_path', page_path)
        .eq('user_ip', hashedIp)
        .single()

      if (selectError || !existingData) {
        // Create new record
        const { data: newData, error: insertError } = await supabase
          .from('site_analytics')
          .insert({
            visit_date: today,
            page_path: page_path,
            user_ip: hashedIp,
            user_agent: userAgent,
            referrer: referrer || null,
            visit_count: 1
          })
          .select()

        if (insertError) {
          console.error('Error inserting visit:', insertError)
          return NextResponse.json(
            { success: false, error: 'Erro ao registrar visita' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: newData[0]
        })
      } else {
        // Update existing record
        const { data: updateData, error: updateError } = await supabase
          .from('site_analytics')
          .update({ visit_count: existingData.visit_count + 1 })
          .eq('visit_date', today)
          .eq('page_path', page_path)
          .eq('user_ip', hashedIp)
          .select()

        if (updateError) {
          console.error('Error updating visit:', updateError)
          return NextResponse.json(
            { success: false, error: 'Erro ao atualizar visita' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: updateData[0]
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    })

  } catch (error) {
    console.error('Error in visit analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/analytics/visit - Get visit stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '30')
    const page = url.searchParams.get('page')

    let query = supabase
      .from('site_analytics')
      .select('*')
      .gte('visit_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('visit_date', { ascending: false })

    if (page) {
      query = query.eq('page_path', page)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching visit stats:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar estatísticas' },
        { status: 500 }
      )
    }

    // Group by date for summary
    const dailyStats = data.reduce((acc: any, visit: any) => {
      const date = visit.visit_date
      if (!acc[date]) {
        acc[date] = {
          date,
          total_visits: 0,
          unique_ips: new Set(),
          pages: new Set()
        }
      }
      acc[date].total_visits += visit.visit_count
      acc[date].unique_ips.add(visit.user_ip)
      acc[date].pages.add(visit.page_path)
      return acc
    }, {})

    // Convert sets to counts
    const summary = Object.values(dailyStats).map((day: any) => ({
      date: day.date,
      total_visits: day.total_visits,
      unique_visitors: day.unique_ips.size,
      unique_pages: day.pages.size
    }))

    return NextResponse.json({
      success: true,
      data: {
        raw_data: data,
        daily_summary: summary
      }
    })

  } catch (error) {
    console.error('Error in visit analytics GET:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}