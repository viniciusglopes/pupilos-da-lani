import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/analytics/click
export async function POST(request: NextRequest) {
  try {
    const { pupilo_id } = await request.json()

    if (!pupilo_id) {
      return NextResponse.json(
        { success: false, error: 'pupilo_id é obrigatório' },
        { status: 400 }
      )
    }

    // Use UPSERT to increment click count for today
    const { data, error } = await supabase
      .from('pupilo_clicks')
      .upsert(
        {
          pupilo_id,
          click_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
          click_count: 1
        },
        {
          onConflict: 'pupilo_id,click_date',
          ignoreDuplicates: false
        }
      )
      .select()

    if (error) {
      // If upsert failed, try to increment existing record
      const { data: existingData, error: selectError } = await supabase
        .from('pupilo_clicks')
        .select('click_count')
        .eq('pupilo_id', pupilo_id)
        .eq('click_date', new Date().toISOString().split('T')[0])
        .single()

      if (selectError || !existingData) {
        // Create new record
        const { data: newData, error: insertError } = await supabase
          .from('pupilo_clicks')
          .insert({
            pupilo_id,
            click_date: new Date().toISOString().split('T')[0],
            click_count: 1
          })
          .select()

        if (insertError) {
          console.error('Error inserting click:', insertError)
          return NextResponse.json(
            { success: false, error: 'Erro ao registrar clique' },
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
          .from('pupilo_clicks')
          .update({ click_count: existingData.click_count + 1 })
          .eq('pupilo_id', pupilo_id)
          .eq('click_date', new Date().toISOString().split('T')[0])
          .select()

        if (updateError) {
          console.error('Error updating click:', updateError)
          return NextResponse.json(
            { success: false, error: 'Erro ao atualizar clique' },
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
    console.error('Error in click analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}