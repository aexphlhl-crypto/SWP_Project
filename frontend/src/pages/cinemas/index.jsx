import { useData } from '@/contexts/data-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, ExternalLink, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'

function CinemaCard({ cinema }) {
  const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(cinema.name + ' ' + cinema.address)}`

  return (
    <div className="group overflow-hidden rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-all duration-300">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-secondary">
        <img
          src={cinema.image || `https://picsum.photos/seed/cinema-${cinema.id}/600/300`}
          alt={cinema.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-bold text-base leading-snug text-white line-clamp-2">{cinema.name}</h3>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
          <span className="line-clamp-2">{cinema.address}</span>
        </p>

        {cinema.operatingHours && (
          <p className="text-xs text-muted-foreground pl-6">{cinema.operatingHours}</p>
        )}

        <div className="flex gap-2 pt-1">
          <Button asChild size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium">
            <Link to={`/movies`}>
              <Ticket className="w-3.5 h-3.5 mr-1.5" />
              Đặt vé
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="border-border/60 hover:border-primary/40">
            <a href={mapsUrl} target="_blank" rel="noreferrer" aria-label="Xem bản đồ">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Bản đồ
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CinemasPage() {
  const { cinemas } = useData()
  const cities = [...new Set(cinemas.map(c => c.city).filter(Boolean))]

  return (
    <div className="container mx-auto px-4 max-w-[1400px] py-10 space-y-12">

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Hệ thống Rạp CineBook</h1>
        <p className="text-muted-foreground">
          {cinemas.length} chi nhánh tại {cities.length} thành phố - mang đến trải nghiệm xem phim đỉnh cao
        </p>
      </div>

      {/* Cities */}
      <div className="space-y-10">
        {cities.map(city => {
          const cityCinemas = cinemas.filter(c => c.city === city)
          return (
            <div key={city} className="space-y-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">{city}</h2>
                <Badge variant="secondary" className="font-normal text-xs">
                  {cityCinemas.length} rạp
                </Badge>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cityCinemas.map(cinema => (
                  <CinemaCard key={cinema.id} cinema={cinema} />
                ))}
              </div>
            </div>
          )
        })}

        {cinemas.length === 0 && (
          <p className="text-muted-foreground text-center py-16">Chưa có rạp chiếu phim nào.</p>
        )}
      </div>
    </div>
  )
}
