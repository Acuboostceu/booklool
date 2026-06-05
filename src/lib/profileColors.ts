export type ProfileColor = 'green' | 'pink' | 'purple' | 'yellow' | 'blue' | 'orange' | 'mint' | 'coral'

export const PROFILE_COLORS: Record<ProfileColor, {
  bg: string
  accent: string
  star: string
  dot: string
  label: string
}> = {
  green:  { bg: 'var(--green-light)',  accent: 'var(--green-dark)',  star: 'var(--green)',  dot: '#6ab87a', label: '초록' },
  pink:   { bg: 'var(--pink-light)',   accent: 'var(--pink-dark)',   star: 'var(--pink)',   dot: '#e8a0b4', label: '핑크' },
  purple: { bg: 'var(--purple-light)', accent: 'var(--purple-dark)', star: 'var(--purple)', dot: '#a896d4', label: '보라' },
  yellow: { bg: 'var(--yellow-light)', accent: 'var(--yellow-dark)', star: 'var(--yellow)', dot: '#e8cc78', label: '노랑' },
  blue:   { bg: '#e8f4fd', accent: '#1a6fa8', star: '#4aa8e0', dot: '#4aa8e0', label: '파랑' },
  orange: { bg: '#fdf0e8', accent: '#a85a1a', star: '#e07a4a', dot: '#e07a4a', label: '주황' },
  mint:   { bg: '#e8fdf5', accent: '#1a8a6a', star: '#4ac9a0', dot: '#4ac9a0', label: '민트' },
  coral:  { bg: '#fde8e8', accent: '#a81a1a', star: '#e06060', dot: '#e06060', label: '산호' },
}

export const COLOR_LIST = Object.keys(PROFILE_COLORS) as ProfileColor[]

export function getProfileColor(color: string | null) {
  return PROFILE_COLORS[(color as ProfileColor) ?? 'green'] ?? PROFILE_COLORS.green
}
