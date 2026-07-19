import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { greetingForNow } from '../utils/greeting'

const DEFAULT_LAT = 37.7749
const DEFAULT_LON = -122.4194

async function fetchWeatherFahrenheit(lat, lon) {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('current', 'temperature_2m,weather_code')
  url.searchParams.set('temperature_unit', 'fahrenheit')
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('weather')
  const data = await res.json()
  const t = data.current?.temperature_2m
  if (t == null) throw new Error('weather')
  return `${Math.round(t)}°F outside`
}

export default function WelcomePage() {
  const [weather, setWeather] = useState('Checking weather…')
  const now = new Date()
  const weekday = now.toLocaleDateString(undefined, { weekday: 'long' })
  const greeting = greetingForNow(now)

  useEffect(() => {
    let cancelled = false

    function done(msg) {
      if (!cancelled) setWeather(msg)
    }

    if (!navigator.geolocation) {
      fetchWeatherFahrenheit(DEFAULT_LAT, DEFAULT_LON)
        .then((w) => done(`${w} (default area)`))
        .catch(() => done('Weather unavailable'))
      return () => {
        cancelled = true
      }
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherFahrenheit(pos.coords.latitude, pos.coords.longitude)
          .then((w) => done(w))
          .catch(() => done('Weather unavailable'))
      },
      () => {
        fetchWeatherFahrenheit(DEFAULT_LAT, DEFAULT_LON)
          .then((w) => done(`${w} (enable location for yours)`))
          .catch(() => done('Weather unavailable'))
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    )

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Link
      to="/caretaker"
      className="page page--welcome welcome__whole-tap"
      aria-label="Tap anywhere to start — sign in to your schedule"
    >
      <div className="welcome__body">
        <p className="welcome__greet">{greeting}</p>
        <p className="welcome__day">
          Today is <strong>{weekday}</strong>
        </p>
        <p className="welcome__weather">{weather}</p>
      </div>
      <div className="welcome__actions">
        <span className="welcome__cta">Tap to start</span>
      </div>
    </Link>
  )
}
