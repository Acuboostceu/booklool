export type Profile = {
  id: string
  user_id: string
  role: 'parent' | 'child'
  name: string
  avatar_url?: string
  parent_id?: string // for child profiles
  created_at: string
}

export type Book = {
  id: string
  profile_id: string
  title: string
  author?: string
  publisher?: string
  cover_url?: string
  photo_url?: string // original photo taken by user
  description?: string
  isbn?: string
  language: 'ko' | 'en'
  rating?: number // 1-5
  comment?: string
  ai_question?: string
  ai_answer?: string
  read_at: string
  created_at: string
}

export type BookSearchResult = {
  title: string
  author: string
  publisher?: string
  cover_url?: string
  description?: string
  isbn?: string
  language: 'ko' | 'en'
}

export type Badge = {
  id: string
  profile_id: string
  type: BadgeType
  earned_at: string
}

export type BadgeType =
  | 'first_book'
  | 'books_5'
  | 'books_10'
  | 'books_20'
  | 'books_50'
  | 'streak_7'
  | 'streak_30'
  | 'answered_ai'
