package com.example.HotelBooking.repositories;

import com.example.HotelBooking.entities.Room;
import com.example.HotelBooking.enums.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {


    @Query("""
            SELECT r FROM Room r
            WHERE r.isActive = true
            AND r.id NOT IN (
                SELECT b.room.id
                FROM Booking b
                WHERE :checkInDate <= b.checkOutDate
                AND :checkOutDate >= b.checkInDate
                AND b.bookingStatus IN ('BOOKED', 'CHECKED_IN')
            )
            AND (:roomType IS NULL OR r.type = :roomType)
            """)
    List<Room> findAvailableRooms(
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate,
            @Param("roomType") RoomType roomType
    );


    @Query("""
                SELECT r FROM Room r
                WHERE r.isActive = true
                AND (CAST(r.roomNumber AS string) LIKE %:searchParam%
                   OR LOWER(r.type) LIKE LOWER(:searchParam)
                   OR CAST(r.price AS string) LIKE %:searchParam%
                   OR CAST(r.capacity AS string) LIKE %:searchParam%
                   OR LOWER(r.description) LIKE LOWER(CONCAT('%', :searchParam, '%')))
            """)
    List<Room> searchRooms(@Param("searchParam") String searchParam);

    // Method to get all rooms (including inactive) for admin
    @Query("SELECT r FROM Room r")
    List<Room> findAllRoomsForAdmin();

    // Method to get only active rooms for public
    @Query("SELECT r FROM Room r WHERE r.isActive = true")
    List<Room> findActiveRooms();

}
