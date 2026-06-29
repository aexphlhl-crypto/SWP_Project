import { useData } from '@/contexts/data-context'
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

// Removed mock cinemaDetails

export default function CinemasPage() {
  const { cinemas } = useData();
  const cities = [...new Set(cinemas.map(c => c.city))];

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Hệ thống Rạp CineBook</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {cinemas.length} chi nhánh trải dài tại {cities.length} thành phố lớn — mang đến trải nghiệm xem phim đẳng cấp
        </p>
      </div>

      <div className="grid gap-10">
        {cities.map(city => (
          <div key={city} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{city}</h2>
              <Badge variant="secondary" className="font-normal">
                {cinemas.filter(c => c.city === city).length} rạp
              </Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cinemas.filter(c => c.city === city).map(cinema => {
                return (
                  <Card key={cinema.id} className="bg-card border-border overflow-hidden hover:border-primary/50 transition-colors">
                    <div className="h-48 overflow-hidden bg-secondary">
                      <img src={cinema.image || 'https://placehold.co/600x400/png'} alt={cinema.name} className="w-full h-full object-cover" />
                    </div>
                    <CardHeader>
                      <h3 className="font-bold text-lg leading-tight">{cinema.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-start gap-1.5 mt-1">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{cinema.address}</span>
                      </p>
                    </CardHeader>
                    <div className="w-full h-40">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight="0" 
                        marginWidth="0" 
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(cinema.name + ' ' + cinema.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                        title={`Map to ${cinema.name}`}
                      ></iframe>
                    </div>
                    <CardContent className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="w-4 h-4" /> Đang cập nhật
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-4 h-4" /> Đang cập nhật
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button asChild className="flex-1">
                          <Link to="/movies">Đặt vé ngay</Link>
                        </Button>
                        <Button variant="outline" size="icon" asChild title="Xem bản đồ">
                          <a href={`https://maps.google.com/maps?q=${encodeURIComponent(cinema.name + ' ' + cinema.address)}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}