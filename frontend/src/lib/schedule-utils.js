import { format, addDays, startOfWeek, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BUFFER_TIME_MINUTES } from '@/types/schedule';
import { movies } from './mock-data';

// Mock rooms data
export const rooms = [{
  id: 'room-1',
  name: 'Phòng 1',
  cinemaId: '1',
  capacity: 120,
  type: 'standard'
}, {
  id: 'room-2',
  name: 'Phòng 2',
  cinemaId: '1',
  capacity: 150,
  type: '3d'
}, {
  id: 'room-3',
  name: 'Phòng 3',
  cinemaId: '1',
  capacity: 200,
  type: 'imax'
}, {
  id: 'room-4',
  name: 'Phòng 4',
  cinemaId: '1',
  capacity: 80,
  type: '4dx'
}, {
  id: 'room-5',
  name: 'Phòng 5',
  cinemaId: '1',
  capacity: 100,
  type: 'standard'
}];

// Generate initial schedule data
export function generateInitialSchedule() {
  const today = new Date();
  const showtimes = [];

  // Generate showtimes for the week
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = format(addDays(today, dayOffset), 'yyyy-MM-dd');

    // Room 1 schedule
    showtimes.push({
      id: `st-${date}-r1-1`,
      movieId: '1',
      movie: movies.find(m => m.id === '1'),
      roomId: 'room-1',
      roomName: 'Phòng 1',
      date,
      startTime: '09:00',
      endTime: '11:43',
      price: 75000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r1-2`,
      movieId: '3',
      movie: movies.find(m => m.id === '3'),
      roomId: 'room-1',
      roomName: 'Phòng 1',
      date,
      startTime: '12:30',
      endTime: '14:04',
      price: 75000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r1-3`,
      movieId: '2',
      movie: movies.find(m => m.id === '2'),
      roomId: 'room-1',
      roomName: 'Phòng 1',
      date,
      startTime: '15:00',
      endTime: '17:46',
      price: 90000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r1-4`,
      movieId: '4',
      movie: movies.find(m => m.id === '4'),
      roomId: 'room-1',
      roomName: 'Phòng 1',
      date,
      startTime: '19:00',
      endTime: '20:55',
      price: 90000,
      status: 'scheduled'
    });

    // Room 2 schedule
    showtimes.push({
      id: `st-${date}-r2-1`,
      movieId: '2',
      movie: movies.find(m => m.id === '2'),
      roomId: 'room-2',
      roomName: 'Phòng 2',
      date,
      startTime: '10:00',
      endTime: '12:46',
      price: 100000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r2-2`,
      movieId: '1',
      movie: movies.find(m => m.id === '1'),
      roomId: 'room-2',
      roomName: 'Phòng 2',
      date,
      startTime: '14:00',
      endTime: '16:43',
      price: 100000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r2-3`,
      movieId: '4',
      movie: movies.find(m => m.id === '4'),
      roomId: 'room-2',
      roomName: 'Phòng 2',
      date,
      startTime: '18:00',
      endTime: '19:55',
      price: 110000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r2-4`,
      movieId: '2',
      movie: movies.find(m => m.id === '2'),
      roomId: 'room-2',
      roomName: 'Phòng 2',
      date,
      startTime: '21:00',
      endTime: '23:46',
      price: 110000,
      status: 'scheduled'
    });

    // Room 3 IMAX schedule
    showtimes.push({
      id: `st-${date}-r3-1`,
      movieId: '4',
      movie: movies.find(m => m.id === '4'),
      roomId: 'room-3',
      roomName: 'Phòng 3',
      date,
      startTime: '11:00',
      endTime: '12:55',
      price: 150000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r3-2`,
      movieId: '2',
      movie: movies.find(m => m.id === '2'),
      roomId: 'room-3',
      roomName: 'Phòng 3',
      date,
      startTime: '14:30',
      endTime: '17:16',
      price: 150000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r3-3`,
      movieId: '1',
      movie: movies.find(m => m.id === '1'),
      roomId: 'room-3',
      roomName: 'Phòng 3',
      date,
      startTime: '19:30',
      endTime: '22:13',
      price: 180000,
      status: 'scheduled'
    });

    // Room 4 4DX schedule
    showtimes.push({
      id: `st-${date}-r4-1`,
      movieId: '4',
      movie: movies.find(m => m.id === '4'),
      roomId: 'room-4',
      roomName: 'Phòng 4',
      date,
      startTime: '10:30',
      endTime: '12:25',
      price: 180000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r4-2`,
      movieId: '3',
      movie: movies.find(m => m.id === '3'),
      roomId: 'room-4',
      roomName: 'Phòng 4',
      date,
      startTime: '13:30',
      endTime: '15:04',
      price: 150000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r4-3`,
      movieId: '4',
      movie: movies.find(m => m.id === '4'),
      roomId: 'room-4',
      roomName: 'Phòng 4',
      date,
      startTime: '16:30',
      endTime: '18:25',
      price: 180000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r4-4`,
      movieId: '1',
      movie: movies.find(m => m.id === '1'),
      roomId: 'room-4',
      roomName: 'Phòng 4',
      date,
      startTime: '20:00',
      endTime: '22:43',
      price: 200000,
      status: 'scheduled'
    });

    // Room 5 schedule
    showtimes.push({
      id: `st-${date}-r5-1`,
      movieId: '3',
      movie: movies.find(m => m.id === '3'),
      roomId: 'room-5',
      roomName: 'Phòng 5',
      date,
      startTime: '09:30',
      endTime: '11:04',
      price: 65000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r5-2`,
      movieId: '7',
      movie: movies.find(m => m.id === '7'),
      roomId: 'room-5',
      roomName: 'Phòng 5',
      date,
      startTime: '12:00',
      endTime: '13:58',
      price: 65000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r5-3`,
      movieId: '3',
      movie: movies.find(m => m.id === '3'),
      roomId: 'room-5',
      roomName: 'Phòng 5',
      date,
      startTime: '15:00',
      endTime: '16:34',
      price: 75000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r5-4`,
      movieId: '7',
      movie: movies.find(m => m.id === '7'),
      roomId: 'room-5',
      roomName: 'Phòng 5',
      date,
      startTime: '18:00',
      endTime: '19:58',
      price: 85000,
      status: 'scheduled'
    }, {
      id: `st-${date}-r5-5`,
      movieId: '7',
      movie: movies.find(m => m.id === '7'),
      roomId: 'room-5',
      roomName: 'Phòng 5',
      date,
      startTime: '21:00',
      endTime: '22:58',
      price: 85000,
      status: 'scheduled'
    });
  }
  return showtimes;
}

// Get week days starting from today
export function getWeekDays(startDate = new Date()) {
  const weekStart = startOfWeek(startDate, {
    weekStartsOn: 1
  }); // Start on Monday
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    days.push({
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEEE', {
        locale: vi
      }),
      dayNumber: date.getDate(),
      isToday: isToday(date)
    });
  }
  return days;
}

// Parse time string to minutes
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Calculate end time based on movie duration
export function calculateEndTime(startTime, durationMinutes) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  const hours = Math.floor(endMinutes / 60) % 24;
  const minutes = endMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Check for conflicts
export function checkConflicts(newShowtime, existingShowtimes, excludeId) {
  const conflicts = [];
  const newStart = timeToMinutes(newShowtime.startTime);
  const newEnd = timeToMinutes(newShowtime.endTime);

  // Filter showtimes for the same room and date
  const relevantShowtimes = existingShowtimes.filter(st => st.roomId === newShowtime.roomId && st.date === newShowtime.date && st.id !== excludeId && st.status !== 'cancelled');
  for (const existing of relevantShowtimes) {
    const existingStart = timeToMinutes(existing.startTime);
    const existingEnd = timeToMinutes(existing.endTime);

    // Check for direct overlap
    if (newStart < existingEnd && newEnd > existingStart) {
      conflicts.push({
        type: 'overlap',
        conflictingShowtimeId: existing.id,
        message: `Trùng giờ chiếu với "${existing.movie?.title}" (${existing.startTime} - ${existing.endTime})`
      });
      continue;
    }

    // Check for insufficient buffer (30 minutes)
    const gapBefore = existingStart - newEnd;
    const gapAfter = newStart - existingEnd;
    if (gapBefore >= 0 && gapBefore < BUFFER_TIME_MINUTES) {
      conflicts.push({
        type: 'insufficient_buffer',
        conflictingShowtimeId: existing.id,
        message: `Không đủ ${BUFFER_TIME_MINUTES} phút nghỉ trước "${existing.movie?.title}" (${existing.startTime}). Thiếu ${BUFFER_TIME_MINUTES - gapBefore} phút.`
      });
    }
    if (gapAfter >= 0 && gapAfter < BUFFER_TIME_MINUTES) {
      conflicts.push({
        type: 'insufficient_buffer',
        conflictingShowtimeId: existing.id,
        message: `Không đủ ${BUFFER_TIME_MINUTES} phút nghỉ sau "${existing.movie?.title}" (${existing.endTime}). Thiếu ${BUFFER_TIME_MINUTES - gapAfter} phút.`
      });
    }
  }
  return conflicts;
}

// Get room type label
export function getRoomTypeLabel(type) {
  const labels = {
    standard: '2D',
    '3d': '3D',
    imax: 'IMAX',
    '4dx': '4DX'
  };
  return labels[type];
}

// Get room type color
export function getRoomTypeColor(type) {
  const colors = {
    standard: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    '3d': 'bg-green-500/20 text-green-400 border-green-500/30',
    imax: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    '4dx': 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  };
  return colors[type];
}