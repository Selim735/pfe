// update-appointment.dto.ts
export class UpdateAppointmentDto {
    appointmentDate?: string;
    startTime?: string;
    endTime?: string;
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
    notes?: string;
  }
  