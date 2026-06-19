import { createContext, useContext, useState, useEffect } from 'react';
import { movies as initialMovies, cinemas as initialCinemas, concessionItems as initialConcessions, mockResaleListings as initialResaleListings, initialShowtimes, initialNews, initialSettings } from '@/lib/mock-data';

const DataContext = createContext(undefined);

const mapMovieFromApi = (m) => ({
  ...m,
  id: m.movieId?.toString(),
  poster: m.posterUrl,
  backdrop: m.posterUrl,
  trailer: m.trailerUrl,
  rating: Number(m.avgRating ?? 0),
  duration: m.durationMin,
  status: m.status === 'NowShowing' ? 'now_showing' : (m.status === 'ComingSoon' ? 'coming_soon' : m.status),
  genres: m.genres ? m.genres.map(g => g.name) : [],
  description: m.synopsis,
  cast: m.castList ? m.castList.split(',').map((c, i) => ({ id: i.toString(), name: c.trim() })) : []
});

export function DataProvider({ children }) {
  // Khởi tạo state rỗng ban đầu, sẽ được fetch từ backend
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);

  const refreshMovies = async () => {
    try {
      const { default: movieApi } = await import('@/api/movieApi');
      const response = await movieApi.getMovies();
      if (response.success && response.data?.content) {
        setMovies(response.data.content.map(mapMovieFromApi));
      }
    } catch (err) {
      console.error('Failed to fetch movies from API', err);
    }
  };

  // Fetch movies from real backend API on mount
  useEffect(() => {
    refreshMovies();
  }, []);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const { default: genreApi } = await import('@/api/genreApi');
        const response = await genreApi.getAll();
        if (response.success && response.data) {
          setGenres(response.data.map(g => ({
            id: g.genreId.toString(),
            name: g.name,
          })));
        }
      } catch (err) {
        console.error('Failed to fetch genres from API', err);
      }
    };
    fetchGenres();
  }, []);

  const [cinemas, setCinemas] = useState([]);

  // Fetch cinemas from backend
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const { default: cinemaApi } = await import('@/api/cinemaApi');
        const response = await cinemaApi.getCinemas();
        if (response.success && response.data?.content) {
          const mappedCinemas = response.data.content.map(c => ({
            id: c.cinemaId.toString(),
            name: c.name,
            address: c.address,
            city: c.city
          }));
          setCinemas(mappedCinemas);
        }
      } catch (err) {
        console.error('Failed to fetch cinemas from API', err);
      }
    };
    fetchCinemas();
  }, []);

  const [concessions, setConcessions] = useState([]);

  const [resaleListings, setResaleListings] = useState([]);

  const [showtimes, setShowtimes] = useState([]);

  // Fetch showtimes from backend
  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const { default: showtimeApi } = await import('@/api/showtimeApi');
        const response = await showtimeApi.getAllShowtimes();
        if (response.success && response.data?.content) {
          const mappedShowtimes = response.data.content.map(s => ({
            id: s.showtimeId.toString(),
            movieId: s.movieId.toString(),
            cinemaId: s.cinemaId.toString(),
            cinemaName: s.cinemaName,
            roomName: s.roomName,
            date: s.startTime.split('T')[0],
            startTime: s.startTime.split('T')[1].substring(0, 5),
            endTime: s.endTime.split('T')[1].substring(0, 5),
            price: 85000, // default if null
            type: '2D', // assuming 2D for now
            availableSeats: s.totalSeats
          }));
          setShowtimes(mappedShowtimes);
        }
      } catch (err) {
        console.error('Failed to fetch showtimes from API', err);
      }
    };
    fetchShowtimes();
  }, []);

  const [news, setNews] = useState([]);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('cinebook_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  // Fetch real settings from backend
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const { default: configApi } = await import('@/api/configApi');
        const response = await configApi.getAllConfigs();
        if (response.success && response.data) {
          setSettings(prev => {
            const newSettings = { ...prev };
            response.data.forEach(c => {
              if (c.configKey === 'vat_rate') newSettings.vatPercent = parseFloat(c.configValue) * 100;
              if (c.configKey === 'weekend_surcharge_percent') newSettings.weekendSurcharge = parseFloat(c.configValue);
              if (c.configKey === 'evening_surcharge_percent') newSettings.eveningSurcharge = parseFloat(c.configValue);
            });
            return newSettings;
          });
        }
      } catch (err) {
        console.error('Failed to fetch configs from API', err);
      }
    };
    fetchConfigs();
  }, []);

  // State cho Bookings (Vé đã mua)
  const [bookings, setBookings] = useState([]);

  // Lưu state vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem('cinebook_movies', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('cinebook_cinemas', JSON.stringify(cinemas));
  }, [cinemas]);

  useEffect(() => {
    localStorage.setItem('cinebook_concessions', JSON.stringify(concessions));
  }, [concessions]);

  useEffect(() => {
    localStorage.setItem('cinebook_resale', JSON.stringify(resaleListings));
  }, [resaleListings]);

  useEffect(() => {
    localStorage.setItem('cinebook_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('cinebook_showtimes', JSON.stringify(showtimes));
  }, [showtimes]);

  useEffect(() => {
    localStorage.setItem('cinebook_news', JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem('cinebook_settings', JSON.stringify(settings));
  }, [settings]);

  // Các hàm tương tác với Movies
  const addMovie = (newMovie) => {
    setMovies(prev => [...prev, { ...newMovie, id: Date.now().toString() }]);
  };
  const updateMovie = (id, updatedData) => {
    setMovies(prev => prev.map(m => m.id === id ? { ...m, ...updatedData } : m));
  };
  const deleteMovie = (id) => {
    setMovies(prev => prev.filter(m => m.id !== id));
  };

  // Các hàm tương tác với Showtimes (Có kiểm tra xung đột - Conflict check)
  const checkConflict = (newShowtime, excludeId = null) => {
    return showtimes.some(s => {
      if (s.id === excludeId) return false;
      // Trùng rạp, phòng, ngày
      if (s.cinemaId === newShowtime.cinemaId && s.roomName === newShowtime.roomName && s.date === newShowtime.date) {
        const parseTime = (t) => {
          const [h, m] = t.split(':').map(Number);
          return h * 60 + m;
        };
        const nStart = parseTime(newShowtime.startTime);
        const nEnd = parseTime(newShowtime.endTime);
        const sStart = parseTime(s.startTime);
        const sEnd = parseTime(s.endTime);
        
        // Có giao nhau về thời gian không (cộng thêm 15p dọn dẹp)
        return (nStart < sEnd + 15) && (nEnd + 15 > sStart);
      }
      return false;
    });
  };

  const addShowtime = (newShowtime) => {
    if (checkConflict(newShowtime)) {
      throw new Error('Trùng lịch chiếu! Phòng này đã có lịch trong khoảng thời gian đã chọn (bao gồm 15 phút dọn dẹp).');
    }
    const st = { ...newShowtime, id: 'st' + Date.now() };
    setShowtimes(prev => [...prev, st].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return st;
  };

  const updateShowtime = (id, updatedData) => {
    if (checkConflict({ ...showtimes.find(s => s.id === id), ...updatedData }, id)) {
      throw new Error('Trùng lịch chiếu! Phòng này đã có lịch trong khoảng thời gian đã chọn.');
    }
    setShowtimes(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s).sort((a, b) => a.startTime.localeCompare(b.startTime)));
  };

  const deleteShowtime = (id) => {
    // Chỉ xóa được nếu chưa có vé bán ra (Mô phỏng ở đây luôn xóa được)
    setShowtimes(prev => prev.filter(s => s.id !== id));
  };

  // Các hàm tương tác với Bookings
  const createBooking = (bookingData) => {
    const newBooking = {
      id: 'BK' + Date.now().toString().slice(-6),
      createdAt: new Date().toISOString(),
      ...bookingData
    };
    setBookings(prev => [newBooking, ...prev]);
    
    // Giảm availableSeats của suất chiếu đó
    setShowtimes(prev => prev.map(s => s.id === bookingData.showtime.id ? { ...s, availableSeats: Math.max(0, s.availableSeats - bookingData.seats.length) } : s));

    return newBooking;
  };

  // Tương tác với Bắp nước
  const addConcession = (item) => {
    setConcessions(prev => [...prev, { ...item, id: 'c' + Date.now() }]);
  };
  const updateConcession = (id, data) => {
    setConcessions(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };
  const deleteConcession = (id) => {
    setConcessions(prev => prev.filter(c => c.id !== id));
  };

  // Tương tác với Chợ vé
  const updateResaleStatus = (id, newStatus) => {
    setResaleListings(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  // Tương tác với Tin tức
  const addNews = (newsData) => {
    const newArticle = { ...newsData, id: 'n' + Date.now().toString(), createdAt: new Date().toISOString() };
    setNews(prev => [newArticle, ...prev]);
  };
  const updateNews = (id, updatedData) => {
    setNews(prev => prev.map(n => n.id === id ? { ...n, ...updatedData } : n));
  };
  const deleteNews = (id) => {
    setNews(prev => prev.filter(n => n.id !== id));
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
  };

  return (
    <DataContext.Provider value={{
      movies, genres, cinemas, concessions, resaleListings, bookings, showtimes, news, settings,
      refreshMovies, addMovie, updateMovie, deleteMovie,
      addShowtime, updateShowtime, deleteShowtime,
      createBooking,
      addConcession, updateConcession, deleteConcession,
      updateResaleStatus,
      addNews, updateNews, deleteNews,
      updateSettings
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
