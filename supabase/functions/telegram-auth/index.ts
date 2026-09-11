import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { initData } = await req.json()
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')

    if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN не установлен')

    // --- ВСТРОЕННАЯ ПРОВЕРКА ДАННЫХ TELEGRAM ---
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')
    urlParams.delete('hash')

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    const encoder = new TextEncoder()
    
    // Создаем секретный ключ из токена бота
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode('WebAppData'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const secretKeyBuffer = await crypto.subtle.sign('HMAC', secretKey, encoder.encode(botToken))
    
    // Вычисляем подпись
    const dataKey = await crypto.subtle.importKey(
      'raw',
      secretKeyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signatureBuffer = await crypto.subtle.sign('HMAC', dataKey, encoder.encode(dataCheckString))
    const signatureArray = Array.from(new Uint8Array(signatureBuffer))
    const calculatedHash = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (calculatedHash !== hash) {
      return new Response(JSON.stringify({ error: 'Invalid Telegram data' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    // --- КОНЕЦ ПРОВЕРКИ ---

    const userJson = urlParams.get('user')
    const user = JSON.parse(userJson)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('telegram_id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

    let userId

    if (!existingUser) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          telegram_id: user.id,
          username: user.username || null,
          xp: 0,
          level: 1,
          streak: 0,
        })
        .select()
        .single()

      if (createError) throw createError
      userId = newUser.id
    } else {
      userId = existingUser.id
    }

    return new Response(JSON.stringify({ userId: userId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

