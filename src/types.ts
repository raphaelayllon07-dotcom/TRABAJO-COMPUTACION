import { ReactNode } from 'react';

export interface Specialist {
  id: string;
  nombre: string;
  especialidad: string;
  horario: string[];
}

export interface Patient {
  dni: string;
  nombre: string;
  telefono: string;
  correo: string;
}

export interface Appointment {
  id_cita: string;
  id_paciente: string;
  nombre_paciente: string; // convenient caching
  id_especialista: string;
  fecha: string; // DD/MM/YYYY
  hora: string;  // HH:MM
  sintomas_reportados: string;
  diagnostico_preliminar: string;
  recomendacion_inicial: string;
  estado: 'Confirmada' | 'Atendida' | 'Cancelada';
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export type ActiveTab = 'dashboard' | 'agendar' | 'citas' | 'especialistas';
