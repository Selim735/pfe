export class CreateAppointmentDto {
  serviceId: number;
  appointmentDate: string;  // Date string in the format 'YYYY-MM-DD'
  startTime: string;        // Time string in the format 'HH:MM:SS'
  endTime: string;          // Time string in the format 'HH:MM:SS'
  notes?: string;
}
