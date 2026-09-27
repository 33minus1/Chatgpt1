const digitMap: Record<string, string> = {
  '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9',
  '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9',
}

export function toEnglishDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (char) => digitMap[char] ?? char)
}

export function normalizePhone(value: string) {
  return toEnglishDigits(value).replace(/[\s\-()]/g, '').trim()
}

export function isValidIranMobile(value: string) {
  return /^09\d{9}$/.test(normalizePhone(value))
}

export function cleanShortText(value: string, max = 120) {
  return value.replace(/\s+/g, ' ').trim().slice(0, max)
}

export function isMeaningfulText(value: string, min = 10) {
  return cleanShortText(value, 2000).length >= min
}
