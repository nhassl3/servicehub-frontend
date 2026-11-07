import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { oAuthLogin } = useAuth()
  const started = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // StrictMode в dev вызывает эффект дважды, а токен из хеша можно прочитать только один раз
    if (started.current) return
    started.current = true

    ;(async () => {
      try {
        const token = new URLSearchParams(window.location.hash.slice(1)).get('access_token')
        if (!token) throw new Error('В адресе нет access_token')

        // сразу убираем токен из адресной строки и истории
        window.history.replaceState(null, '', window.location.pathname)

        oAuthLogin(token) // Контекстно вызываем логин, чтобы обновить состояние приложения и сохранить токены в хранилище, а также кэш пользователя

        window.sessionStorage.removeItem('autoLogin')
        navigate('/', { replace: true })
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      }
    })()
  }, [navigate])

  if (error) return <div>Ошибка входа: {error}</div>
  return <div>Выполняем вход…</div>
}