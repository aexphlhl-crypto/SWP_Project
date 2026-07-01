package com.cinebook.backend.modules.resale.service;

import com.cinebook.backend.common.exception.AppException;
import com.cinebook.backend.modules.bookings.entity.Booking;
import com.cinebook.backend.modules.bookings.entity.BookingSeat;
import com.cinebook.backend.modules.bookings.repository.BookingRepository;
import com.cinebook.backend.modules.bookings.repository.BookingSeatRepository;
import com.cinebook.backend.modules.movies.entity.Movie;
import com.cinebook.backend.modules.resale.dto.ResaleListingRequest;
import com.cinebook.backend.modules.resale.dto.ResaleListingResponse;
import com.cinebook.backend.modules.resale.dto.ResaleStatusUpdateRequest;
import com.cinebook.backend.modules.resale.entity.ListingStatus;
import com.cinebook.backend.modules.resale.entity.TicketExchangeListing;
import com.cinebook.backend.modules.resale.repository.ResaleListingRepository;
import com.cinebook.backend.modules.cinemas.entity.Cinema;
import com.cinebook.backend.modules.rooms.entity.Seat;
import com.cinebook.backend.modules.showtimes.entity.Showtime;
import com.cinebook.backend.modules.users.User;
import com.cinebook.backend.modules.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResaleListingService {

    private final ResaleListingRepository resaleListingRepository;
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final UserRepository userRepository;

    public Page<ResaleListingResponse> getAllListings(Pageable pageable) {
        return resaleListingRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<ResaleListingResponse> getActiveListings(Pageable pageable) {
        return resaleListingRepository.findByStatus(ListingStatus.Active, pageable).map(this::mapToResponse);
    }

    public Page<ResaleListingResponse> getMyListings(Long sellerId, Pageable pageable) {
        return resaleListingRepository.findBySellerId(sellerId, pageable).map(this::mapToResponse);
    }

    @Transactional
    public ResaleListingResponse createListing(ResaleListingRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> AppException.notFound("Booking not found"));

        if (!booking.getCustomer().getUserId().equals(request.getSellerId())) {
            throw AppException.forbidden("You do not own this booking");
        }

        // Prevent duplicate seats or FNB
        java.util.List<TicketExchangeListing> existingListings = resaleListingRepository.findByBookingIdAndStatusIn(
            request.getBookingId(), 
            java.util.Arrays.asList(ListingStatus.Active, ListingStatus.Hidden)
        );
        
        if (request.getIncludesFnb() != null && request.getIncludesFnb()) {
            boolean fnbAlreadyListed = existingListings.stream().anyMatch(l -> l.getIncludesFnb() != null && l.getIncludesFnb());
            if (fnbAlreadyListed) {
                throw AppException.badRequest("FNB is already included in another active listing.");
            }
        }
        
        if (request.getSeats() != null && !request.getSeats().isEmpty()) {
            java.util.List<String> requestedSeats = java.util.Arrays.asList(request.getSeats().split("\\s*,\\s*"));
            for (TicketExchangeListing l : existingListings) {
                if (l.getSeats() != null && !l.getSeats().isEmpty()) {
                    java.util.List<String> listedSeats = java.util.Arrays.asList(l.getSeats().split("\\s*,\\s*"));
                    for (String rs : requestedSeats) {
                        if (listedSeats.contains(rs)) {
                            throw AppException.badRequest("Seat " + rs + " is already listed.");
                        }
                    }
                }
            }
        }

        TicketExchangeListing listing = TicketExchangeListing.builder()
                .bookingId(request.getBookingId())
                .sellerId(request.getSellerId())
                .askingPrice(request.getAskingPrice())
                .note(request.getNote())
                .phone(request.getPhone())
                .facebookUrl(request.getFacebookUrl())
                .seats(request.getSeats())
                .includesFnb(request.getIncludesFnb() != null ? request.getIncludesFnb() : false)
                .status(ListingStatus.Active)
                .build();

        return mapToResponse(resaleListingRepository.save(listing));
    }

    @Transactional
    public ResaleListingResponse updateStatus(Long id, ResaleStatusUpdateRequest request) {
        TicketExchangeListing listing = resaleListingRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Listing not found"));

        listing.setStatus(request.getStatus());

        if (request.getStatus() == ListingStatus.Hidden) {
            listing.setHiddenBy(request.getHiddenByAdminId());
            listing.setHiddenReason(request.getHiddenReason());
            listing.setHiddenAt(LocalDateTime.now());
        } else if (request.getStatus() == ListingStatus.Active) {
            // Restore from hidden
            listing.setHiddenBy(null);
            listing.setHiddenReason(null);
            listing.setHiddenAt(null);
        }

        return mapToResponse(resaleListingRepository.save(listing));
    }

    @Transactional
    public ResaleListingResponse updateListing(Long id, com.cinebook.backend.modules.resale.dto.ResaleListingUpdateRequest request) {
        TicketExchangeListing listing = resaleListingRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Listing not found"));

        if (request.getAskingPrice() != null) {
            listing.setAskingPrice(request.getAskingPrice());
        }
        if (request.getNote() != null) {
            listing.setNote(request.getNote());
        }

        return mapToResponse(resaleListingRepository.save(listing));
    }

    @Transactional
    public void deleteListing(Long id) {
        TicketExchangeListing listing = resaleListingRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Listing not found"));
        listing.setStatus(ListingStatus.Deleted);
        resaleListingRepository.save(listing);
    }

    private ResaleListingResponse mapToResponse(TicketExchangeListing listing) {
        Booking booking = bookingRepository.findById(listing.getBookingId()).orElse(null);
        User seller = userRepository.findById(listing.getSellerId()).orElse(null);
        
        String movieTitle = "";
        String moviePoster = "";
        String cinemaName = "";
        String roomName = "";
        String showDate = "";
        String showTime = "";
        Integer originalPrice = 0;
        String seats = listing.getSeats();
        String ticketType = "standard";

        if (booking != null) {
            Showtime showtime = booking.getShowtime();
            originalPrice = booking.getTotalAfterTax();
            if (showtime != null) {
                if (showtime.getMovie() != null) {
                    movieTitle = showtime.getMovie().getTitle();
                    moviePoster = showtime.getMovie().getPosterUrl();
                }
                if (showtime.getRoom() != null) {
                    roomName = showtime.getRoom().getName();
                    if (showtime.getRoom().getCinema() != null) {
                        cinemaName = showtime.getRoom().getCinema().getName();
                    }
                }
                if (showtime.getStartTime() != null) {
                    showDate = showtime.getStartTime().toLocalDate().toString();
                    showTime = showtime.getStartTime().toLocalTime().toString();
                }
            }

            List<BookingSeat> bookingSeats = bookingSeatRepository.findByBooking_Id(booking.getId());
            if (bookingSeats != null && !bookingSeats.isEmpty()) {
                if (seats == null || seats.isEmpty()) {
                    StringBuilder seatBuilder = new StringBuilder();
                    for (BookingSeat bs : bookingSeats) {
                        Seat seat = bs.getSeat();
                        if (seat != null) {
                            if (seatBuilder.length() > 0) seatBuilder.append(", ");
                            seatBuilder.append(seat.getSeatLabel());
                        }
                    }
                    seats = seatBuilder.toString();
                }

                // Determine ticket types based on the actually listed seats
                java.util.List<String> listedLabels = java.util.Arrays.asList(seats.split(",\\s*"));
                java.util.Set<String> types = new java.util.HashSet<>();
                for (BookingSeat bs : bookingSeats) {
                    if (bs.getSeat() != null && listedLabels.contains(bs.getSeat().getSeatLabel())) {
                        if (bs.getSeatType() != null) {
                            types.add(bs.getSeatType().name());
                        }
                    }
                }
                if (!types.isEmpty()) {
                    ticketType = String.join(", ", types);
                }
            }
        }

        return ResaleListingResponse.builder()
                .id("RSL" + listing.getId())
                .bookingId("BK" + listing.getBookingId())
                .movieTitle(movieTitle)
                .moviePoster(moviePoster)
                .cinemaName(cinemaName)
                .roomName(roomName)
                .showDate(showDate)
                .showTime(showTime)
                .seatNumber(seats)
                .ticketType(ticketType)
                .originalPrice(originalPrice)
                .resalePrice(listing.getAskingPrice())
                .includesFnb(listing.getIncludesFnb() != null ? listing.getIncludesFnb() : false)
                .sellerName(seller != null ? seller.getFullName() : "Unknown")
                .sellerPhone(listing.getPhone() != null ? listing.getPhone() : (seller != null ? seller.getPhone() : ""))
                .note(listing.getNote())
                .status(listing.getStatus().name().toLowerCase())
                .hiddenReason(listing.getHiddenReason())
                .hiddenAt(listing.getHiddenAt())
                .createdAt(listing.getCreatedAt())
                .build();
    }
}
