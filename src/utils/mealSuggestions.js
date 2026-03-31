/**
 * General nutrition reminders for childcare logging — not medical advice.
 * Draws on common public-health themes (variety, MyPlate-style groups, hydration).
 */

export function getMealHealthSuggestions(counts, now = new Date()) {
  const hour = now.getHours()
  const v = counts.vegetables ?? 0
  const f = counts.fruits ?? 0
  const g = counts.grains ?? 0
  const p = counts.protein ?? 0
  const d = counts.dairy ?? 0
  const o = counts.oils ?? 0
  const t = counts.treats ?? 0
  const u = counts.unknown ?? 0
  const totalTagged = v + f + g + p + d + o + t + u

  const lines = []

  // Time-of-day framing (throughout the day)
  if (hour >= 5 && hour < 9) {
    lines.push(
      'Morning: breakfast works well with a grain + protein + fruit or veggie (e.g., oatmeal with milk and berries)—helps steady energy for play.'
    )
  } else if (hour >= 9 && hour < 12) {
    lines.push(
      'Mid-morning: offer water again; regular sips matter more than big gulps. Unflavored milk or water are typical go-to’s for young kids.'
    )
  } else if (hour >= 12 && hour < 15) {
    lines.push(
      'Lunch: aim for half the plate as veggies/fruit, a quarter protein, a quarter grains—simple MyPlate-style balance when you can.'
    )
  } else if (hour >= 15 && hour < 18) {
    lines.push(
      'Afternoon snack: pair produce with protein or dairy (apple + cheese, carrots + hummus) to bridge to dinner without only sweets.'
    )
  } else if (hour >= 18 && hour < 21) {
    lines.push(
      'Evening: lighter snacks if dinner was big; calcium-rich foods (yogurt, milk) support growing bones when they fit the family plan.'
    )
  } else {
    lines.push(
      'Across the day: offer meals and snacks on a predictable rhythm so kids aren’t overly hungry or grazing nonstop—helps appetite regulation.'
    )
  }

  // Gaps relative to what they already logged
  if (totalTagged === 0) {
    lines.push(
      'As you log foods, suggestions will reflect what’s missing—start with what they actually ate, separated by commas.'
    )
  }
  if (totalTagged > 0 && v === 0) {
    lines.push(
      'No vegetables tagged yet—leafy greens, carrots, tomatoes, or frozen peas all count toward fiber and vitamins.'
    )
  }
  if (totalTagged > 0 && f === 0) {
    lines.push(
      'No fruit listed—fresh, frozen, or unsweetened applesauce can round out vitamin C and potassium.'
    )
  }
  if (totalTagged > 0 && p === 0) {
    lines.push(
      'No clear protein—eggs, beans, fish, poultry, tofu, or nut butter help muscle repair and fullness.'
    )
  }
  if (totalTagged > 0 && d === 0) {
    lines.push(
      'No dairy tagged—if the family uses dairy, milk, yogurt, and cheese are common calcium and vitamin D sources.'
    )
  }
  if (totalTagged > 0 && g === 0) {
    lines.push(
      'No grains tagged—whole-grain bread, brown rice, or oats add energy and (with whole grains) more fiber.'
    )
  }
  if (t >= 2) {
    lines.push(
      'Several treats are listed—guidelines for kids often suggest keeping added sugars small; balance next bites with whole foods.'
    )
  }
  if (totalTagged >= 4 && v >= 1 && f >= 1 && p >= 1) {
    lines.push(
      'Nice variety so far—keeping colors and food groups spread across meals usually beats perfect single plates.'
    )
  }

  // Standing reminders (not duplicated if already similar)
  lines.push(
    'Iron-rich options (meat, beans, fortified cereal) matter for many toddlers; pair plant iron with vitamin C when you can.'
  )

  // Dedupe similar starts, cap length
  const seen = new Set()
  const out = []
  for (const line of lines) {
    const key = line.slice(0, 40)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(line)
    if (out.length >= 6) break
  }
  return out
}
