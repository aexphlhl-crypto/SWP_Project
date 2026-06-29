import type { Movie } from './movie'

export interface Room {
  id: string
  name: string
  cinemaId: string
  capacity: number
  type: 'standard' | '3d' | 'imax' | '4dx'
}

export interface ScheduleShowtime {
  id: string
  movieId: string
  movie?: Movie
  roomId: string
  roomName: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  price: number
  status: 'scheduled' | 'cancelled' | 'completed'
}

export interface ScheduleConflict {
  type: 'overlap' | 'insufficient_buffer'
  conflictingShowtimeId: string
  message: string
}

export interface WeekDay {
  date: string // YYYY-MM-DD
  dayName: string
  dayNumber: number
  isToday: boolean
}

export const BUFFER_TIME_MINUTES = 30 // Thời gian buffer giữa các ca chiếu
export const TIME_SLOT_HEIGHT = 60 // px per hour
export const START_HOUR = 8 // 8:00 AM
export const END_HOUR = 24 // 12:00 AM (midnight)
