export type MovieStatus = 'now_showing' | 'coming_soon'

export interface Movie {
  id: string
  title: string
  originalTitle?: string
  poster: string
  backdrop?: string
  trailer?: string // YouTube video ID
  rating: number
  duration: number // minutes
  releaseDate: string
  status: MovieStatus
  genres: string[]
  description: string
  director: string
  cast: CastMember[]
  ageRating: string // P, C13, C16, C18
}

export interface CastMember {
  id: string
  name: string
  role: string
  avatar?: string
}

export interface Cinema {
  id: string
  name: string
  address: string
  city: string
}

export interface Showtime {
  id: string
  movieId: string
  cinemaId: string
  cinemaName: string
  roomName: string
  startTime: string
  endTime: string
  date: string
  price: number
  availableSeats: number
  totalSeats: number
}

export interface Genre {
  id: string
  name: string
  slug: string
}
