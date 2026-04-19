package com.appointments.backend.service;

import com.appointments.backend.dto.AppointmentRequest;
import com.appointments.backend.dto.AppointmentResponse;
import com.appointments.backend.model.Appointment;
import com.appointments.backend.model.Role;
import com.appointments.backend.model.Status;
import com.appointments.backend.model.User;
import com.appointments.backend.repository.AppointmentRepository;
import com.appointments.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public AppointmentService(AppointmentRepository appointmentRepository, UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AppointmentResponse bookAppointment(AppointmentRequest request) {
        // Prevent double booking for the same date & time slot
        boolean exists = appointmentRepository.existsByAppointmentDateAndTimeSlotAndStatusNot(
                request.getAppointmentDate(), request.getTimeSlot(), Status.CANCELLED);
        
        if (exists) {
            throw new IllegalArgumentException("Time slot is already booked.");
        }

        // Get or Create User
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> userRepository.save(new User(
                        request.getName(),
                        request.getEmail(),
                        request.getPhone(),
                        Role.CUSTOMER
                )));

        // Assign queue number for the day
        Integer maxQueue = appointmentRepository.findMaxQueueNumberByDate(request.getAppointmentDate());
        int newQueueNumber = (maxQueue == null ? 0 : maxQueue) + 1;

        Appointment appointment = new Appointment(
                user,
                request.getAppointmentDate(),
                request.getTimeSlot(),
                Status.SCHEDULED,
                newQueueNumber
        );

        appointment = appointmentRepository.save(appointment);

        // Simulate Notification
        System.out.println("NOTIFICATION: Appointment booked successfully for " + user.getName() + " on " + appointment.getAppointmentDate() + " at " + appointment.getTimeSlot());

        return mapToResponse(appointment);
    }

    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, Status newStatus) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        
        appointment.setStatus(newStatus);
        appointment = appointmentRepository.save(appointment);

        if (newStatus == Status.IN_PROGRESS) {
            System.out.println("NOTIFICATION: " + appointment.getUser().getName() + ", it is now your turn! Please proceed.");
        }

        return mapToResponse(appointment);
    }

    public Map<String, Object> getLiveQueueNumber(LocalDate date) {
        // Find the currently serving appointment
        return appointmentRepository.findFirstByAppointmentDateAndStatusOrderByQueueNumberAsc(date, Status.IN_PROGRESS)
                .map(app -> Map.<String, Object>of(
                        "currentQueueNumber", app.getQueueNumber(),
                        "timeSlot", app.getTimeSlot(),
                        "status", "SERVING"
                ))
                .orElseGet(() -> Map.of(
                        "currentQueueNumber", "-",
                        "timeSlot", "-",
                        "status", "WAITING"
                ));
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getUser().getName(),
                appointment.getUser().getEmail(),
                appointment.getAppointmentDate(),
                appointment.getTimeSlot(),
                appointment.getStatus(),
                appointment.getQueueNumber()
        );
    }
}
