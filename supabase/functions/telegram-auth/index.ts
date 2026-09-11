import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validate as validateTelegramData } from "https://deno.land/x/telegram_webapp_auth@v1.0.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Обработка CORS (предварительный запрос)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { initData } = await req.json()
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')

    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN не установлен')
    }

    // Валидация данных от Telegram
    const isValid = validateTelegramData(initData, botToken, 86400) // 86400 = 24 часа

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid Telegram data' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Извлекаем данные пользователя из initData
    const urlParams = new URLSearchParams(initData)
    const userJson = urlParams.get('user')
    const user = JSON.parse(userJson)

    // Создаём клиент Supabase с Service Role Key (полный доступ)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Ищем пользователя в нашей таблице users по telegram_id
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('telegram_id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = "No rows found"
      throw fetchError
    }

    let userId

    if (!existingUser) {
      // Создаём нового пользователя
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
      // Обновляем время последнего входа (если нужно)
      userId = existingUser.id
    }

    // Возвращаем ID пользователя во фронтенд
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

