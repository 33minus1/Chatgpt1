import { useEffect, useState } from 'react'
import { listActiveCities } from '../lib/citiesBackend'

type Props = {
  value: string
  onChange: (value: string) => void
  includeAll?: boolean
  placeholder?: string
  disabled?: boolean
}

export function CitySelect({ value, onChange, includeAll = false, placeholder = 'انتخاب کن', disabled = false }: Props) {
  const [cities, setCities] = useState<string[]>(['سقز'])

  useEffect(() => {
    let active = true
    listActiveCities()
      .then((rows) => { if (active && rows.length) setCities(rows) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
      {includeAll ? <option value="">همه شهرها</option> : <option value="">{placeholder}</option>}
      {cities.map((city) => <option key={city} value={city}>{city}</option>)}
    </select>
  )
}
