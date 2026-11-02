export type SupportTurn = {
  role: 'user' | 'assistant'
  content: string
}

export type SupportAnswer = {
  reply: string
  intent: string
  needs_human: boolean
  sources: string[]
  mode: 'ollama' | 'knowledge'
}

export type SupportHealth = {
  ok: boolean
  mode: 'ollama' | 'knowledge'
  model?: string
}

const base = () => (import.meta.env.VITE_SUPPORT_API_URL || '').replace(/\/$/, '')

export const supportChatApi = {
  async health(): Promise<SupportHealth> {
    const response = await fetch(`${base()}/api/support/health`)
    if (!response.ok) throw new Error('Support health failed')
    return response.json()
  },

  async ask(message: string, history: SupportTurn[]): Promise<SupportAnswer> {
    const response = await fetch(`${base()}/api/support/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || !payload.reply) {
      throw new Error(payload.error || 'Support chat failed')
    }
    return payload
  },
}
