<template>
    <div class="booking-table-container">
        <h2>Booking Table</h2>
        <table class="booking-table">
        <thead>
            <tr>
            <th>Booking ID</th>
            <th>Customer Name</th>
            <th>Service</th>
            <th>Date</th>
            <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="booking in bookings" :key="booking.id">
            <td>{{ booking.id }}</td>
            <td>{{ booking.customerName }}</td>
            <td>{{ booking.service }}</td>
            <td>{{ booking.date }}</td>
            <td>{{ booking.status }}</td>
            </tr>
        </tbody>
        </table>
    </div>
</template>