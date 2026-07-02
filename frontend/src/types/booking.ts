export type SeatType = 'standard' | 'vip' | 'couple'
export type SeatStatus = 'available' | 'booked' | 'selected' | 'held'

export interface Seat {
  id: string
  row: string
  number: number
  type: SeatType
  status: SeatStatus
  price: number
}

export interface SeatRow {
  row: string
  seats: Seat[]
}

export interface SeatLayout {
  rows: SeatRow[]
  screen: {
    width: number
    position: 'top' | 'bottom'
  }
}

export interface BookingSession {
  id: string
  movieId: string
  movieTitle: string
  moviePoster: string
  cinemaName: string
  roomName: string
  showDate: string
  showTime: string
  selectedSeats: Seat[]
  totalPrice: number
  expiresAt: Date
}

export interface SeatPricing {
  standard: number
  vip: number
  couple: number
}

// ─── Concession Types (UC-42 / UC-43 / UC-44) ────────────────────────────────

export type ConcessionItemType = 'drink' | 'popcorn' | 'combo'
export type ConcessionItemStatus = 'active' | 'inactive'

export interface ConcessionItem {
  id: string
  name: string
  price: number
  type: ConcessionItemType
  image: string
  status: ConcessionItemStatus
  description?: string
}

export interface ConcessionOrderItem {
  item: ConcessionItem
  quantity: number
}

// ─── Resale Types (UC-45 / UC-46 / UC-47 / UC-48 / UC-49 / UC-50) ────────────

export type ResaleListingStatus = 'active' | 'hidden' | 'expired' | 'deleted' | 'sold'

export interface ResaleListing {
  id: string
  bookingId: string
  movieTitle: string
  moviePoster: string
  cinemaName: string
  roomName: string
  showDate: string
  showTime: string
  seatNumber: string
  ticketType: SeatType
  originalPrice: number
  resalePrice: number
  sellerName: string
  sellerPhone: string
  note?: string
  status: ResaleListingStatus
  createdAt: string
  ownerId: string
  // Admin-hide fields (UC-49 / BR-22 / BR-23)
  hiddenByAdminId?: string
  hiddenReason?: string
  hiddenAt?: string
}
