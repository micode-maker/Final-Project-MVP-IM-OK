const API_NINJAS_QUOTES_URL = 'https://api.api-ninjas.com/v2/quotes'
const CATEGORIES = [
  'success',
  'wisdom',
  'inspirational',
  'faith',
  'happiness',
  'courage',
  'humor',
  'love',
]
const MAX_ATTEMPTS = 3

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function normalizeQuote(rawQuote) {
  return {
    quote: (rawQuote?.quote ?? 'Keep going one day at a time.').trim(),
    author: (rawQuote?.author ?? 'Unknown').trim(),
  }
}

async function requestQuote(apiKey, category, nonce) {
  const url = new URL(API_NINJAS_QUOTES_URL)
  url.searchParams.set('categories', category)
  url.searchParams.set('_', nonce)

  const response = await fetch(url, {
    headers: {
      'X-Api-Key': apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`Quote request failed with status ${response.status}.`)
  }

  const quotes = await response.json()

  if (!Array.isArray(quotes) || quotes.length === 0) {
    throw new Error('Quote service returned an empty response.')
  }

  return normalizeQuote(pickRandom(quotes))
}

export async function fetchMotivationalQuote() {
  const apiKey = import.meta.env.VITE_API_NINJAS_KEY

  if (!apiKey) {
    throw new Error('Missing API Ninjas key. Set VITE_API_NINJAS_KEY in .env.')
  }

  let lastError = null
  const usedCategories = new Set()

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const availableCategories = CATEGORIES.filter((category) => !usedCategories.has(category))
    const category = pickRandom(availableCategories.length > 0 ? availableCategories : CATEGORIES)
    usedCategories.add(category)

    try {
      return await requestQuote(apiKey, category, `${Date.now()}-${Math.random()}`)
    } catch (error) {
      lastError = error
    }
  }

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : "Could not load today's motivational quote.",
  )
}
