// Generate a realistic cinema seat layout
export function generateSeatLayout(pricing) {
  const rows = [];
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

  // Simulate some seats being booked or held
  const getRandomStatus = () => {
    const rand = Math.random();
    if (rand < 0.15) return 'booked';
    if (rand < 0.2) return 'held';
    return 'available';
  };
  rowLabels.forEach((rowLabel, rowIndex) => {
    const seats = [];
    const isVipRow = rowIndex >= 4 && rowIndex <= 6; // Rows E, F, G are VIP
    const isCoupleRow = rowIndex >= 8; // Rows J, K are couple seats

    // Standard rows have 12 seats, couple rows have 6 (pairs)
    const seatCount = isCoupleRow ? 6 : 12;
    for (let i = 1; i <= seatCount; i++) {
      let type = 'standard';
      let price = pricing.standard;
      if (isCoupleRow) {
        type = 'couple';
        price = pricing.couple;
      } else if (isVipRow) {
        type = 'vip';
        price = pricing.vip;
      }

      // Add aisle gaps (no seats at positions 3 and 10 for standard/vip)
      if (!isCoupleRow && (i === 3 || i === 10)) {
        continue;
      }
      const status = getRandomStatus();
      seats.push({
        id: `${rowLabel}${i}`,
        row: rowLabel,
        number: i,
        type,
        status,
        price
      });
    }
    rows.push({
      row: rowLabel,
      seats
    });
  });
  return {
    rows,
    screen: {
      width: 100,
      position: 'top'
    }
  };
}

// Static layout for demo purposes
export function getStaticSeatLayout(pricing) {
  const rows = [];
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

  // Predefined booked seats for consistent demo
  const bookedSeats = new Set([]);
  const heldSeats = new Set([]);
  rowLabels.forEach((rowLabel, rowIndex) => {
    const seats = [];
    const isVipRow = rowIndex >= 4 && rowIndex <= 6;
    const isCoupleRow = rowIndex >= 8;
    const seatCount = isCoupleRow ? 6 : 12;
    for (let i = 1; i <= seatCount; i++) {
      let type = 'standard';
      let price = pricing.standard;
      if (isCoupleRow) {
        type = 'couple';
        price = pricing.couple;
      } else if (isVipRow) {
        type = 'vip';
        price = pricing.vip;
      }
      const seatId = `${rowLabel}${i}`;
      let status = 'available';
      if (bookedSeats.has(seatId)) {
        status = 'booked';
      } else if (heldSeats.has(seatId)) {
        status = 'held';
      }
      seats.push({
        id: seatId,
        row: rowLabel,
        number: i,
        type,
        status,
        price
      });
    }
    rows.push({
      row: rowLabel,
      seats
    });
  });
  return {
    rows,
    screen: {
      width: 100,
      position: 'top'
    }
  };
}