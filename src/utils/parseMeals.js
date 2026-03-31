import { FOOD_CATEGORIES, lookupFoodCategory } from '../data/foodPyramid'

/**
 * Split meals text by comma, semicolon, or newline; tag each piece with a pyramid category.
 */
export function parseMealsToParts(text) {
  if (!text || !String(text).trim()) return []
  return String(text)
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((segment) => {
      const category = lookupFoodCategory(segment)
      return {
        segment,
        category,
        color: FOOD_CATEGORIES[category].color,
      }
    })
}

/**
 * Split raw text for inline coloring (preserves spaces and delimiters exactly).
 */
export function splitMealsTextForRendering(text) {
  if (text == null) return []
  const s = String(text)
  if (s === '') return []
  const chunks = s.split(/([,;\n])/g)
  const out = []
  for (const chunk of chunks) {
    if (chunk === '') continue
    if (/^[,;\n]$/.test(chunk)) {
      out.push({ type: 'delim', value: chunk })
    } else {
      const cat = lookupFoodCategory(chunk.trim())
      out.push({
        type: 'food',
        value: chunk,
        category: cat,
        color: FOOD_CATEGORIES[cat]?.color ?? FOOD_CATEGORIES.unknown.color,
      })
    }
  }
  return out
}

/** Count items per category (excluding unknown from “balance” hints optionally). */
export function countByCategory(parts) {
  const counts = {}
  for (const p of parts) {
    counts[p.category] = (counts[p.category] ?? 0) + 1
  }
  return counts
}

