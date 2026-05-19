/**
 * Typical weekday flow (place names align with trip/journal mileage picks).
 * Keys: getDay() Mon=1 … Fri=5
 */
export const TYPICAL_WEEKDAY_RHYTHM = Object.freeze({
  1: "H's drop off → Lafayette Library (storytime) → home for nap → Moraga Commons",
  2: "H's drop off → Lamorinda (music) → home for nap → Moraga Commons",
  3: "H's drop off → home → Moraga Commons",
  4: "H's drop off → home or straight to Moraga Commons for PT → home for nap → walk after nap & snacks",
  5: "H's drop off → Moraga Commons → home for nap",
})

/** Short prompts — checklist style for family texts. */
export const FAMILY_MESSAGE_PROMPTS = Object.freeze([
  'How the day felt + where you went after drop-off',
  'Playdates / friends / nanny-group moments',
  'Meals & snacks — what they ate or skipped',
  'Potty times & accidents',
  'Nap window with rough times',
  'Inside jokes — songs, “ask her about top 3 songs” type bridges',
  'Health (congestion, mood) and a short sign-off',
])

/** Full examples preserving your tone (for copying rhythm, not auto-insert). */
export const FAMILY_MESSAGE_LONG_EXAMPLES = Object.freeze([
  `We had a great day today! 
After drop off we went straight to the park and had lots of fun with all of the friends. During the bday I was talking with Jane about how cool this nanny group is, really fun crew. 

Poppy ate all of the snacks + pouch except for the grapes. 

If she asks for car crash music, it’s “I love it” by Icona Pop. 
Ask her about her top 3 fav songs and she’ll tell you her favorites, she’ll be willing to take turns lol or maybe ask for her top 10 and you will have a good playlist. 

She peed and pooped at the park around 4:20pm.
She had nanos right before parents were home. 

She napped from ~1pm - 2:30pm. 
Her eyes and nose seem better. 

Have a good night`,

  `We had such a fun day today! 

After dropping Harper off we hangout in the house for a little bit before therapy, she was fussy and not wanting to do much. She was pretty congested in the morning so I’m assuming she was just feeling sick. By 10:30 at the park commons she was already more like herself and her therapy with Katie was really good too. Lots of running on the grass with Lily and Romy.

Poppy pooped in the morning only. She just had a 50% pee accident. 

Poppy ate lots of strawberries (the one you got from the store today is really sweet and soft the best we’ve ever had), she also had a bar and chicken nuggets. 

She’s probably going through a development leap too, lots of questioning and being resistant to listen to our instructions, “no” for everything we suggest lol it’s probably temporary, so funny tho.`,
])

/**
 * @param {string} dateISO yyyy-mm-dd
 * @returns {string}
 */
export function getTypicalDayRhythmLine(dateISO) {
  if (!dateISO || dateISO.length < 10) {
    return 'Pick a day above — a typical flow will show for Mon–Fri.'
  }
  const jsDay = new Date(`${dateISO}T12:00:00`).getDay()
  if (jsDay >= 1 && jsDay <= 5) {
    return TYPICAL_WEEKDAY_RHYTHM[jsDay]
  }
  return 'Weekend — your usual spots; type saved place names for mileage (same as weekdays).'
}

/**
 * @param {string} dateISO
 * @returns {string}
 */
export function getWeekdayLabelForIso(dateISO) {
  if (!dateISO || dateISO.length < 10) return 'This day'
  return new Date(`${dateISO}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long' })
}
