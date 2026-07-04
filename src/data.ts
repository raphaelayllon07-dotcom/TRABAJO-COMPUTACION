import { Specialist, Patient, Appointment } from './types';

export const INITIAL_SPECIALISTS: Record<string, Specialist> = {
  ESP01: {
    id: "ESP01",
    nombre: "Dr. Carlos Mendoza",
    especialidad: "Medicina General",
    horario: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"]
  },
  ESP02: {
    id: "ESP02",
    nombre: "Dra. Ana Taylor",
    especialidad: "Pediatría",
    horario: ["09:00", "10:00", "11:00", "16:00", "17:00"]
  },
  ESP03: {
    id: "ESP03",
    nombre: "Dr. Roberto Arce",
    especialidad: "Cardiología",
    horario: ["08:30", "10:30", "15:30", "16:30"]
  },
  ESP04: {
    id: "ESP04",
    nombre: "Dra. Elena Ruiz",
    especialidad: "Dermatología",
    horario: ["09:00", "11:30", "14:30", "16:00"]
  },
  ESP05: {
    id: "ESP05",
    nombre: "Dr. Luis Camargo",
    especialidad: "Traumatología",
    horario: ["08:00", "10:00", "12:00", "15:00"]
  }
};

export const INITIAL_PATIENTS: Record<string, Patient> = {
  "72049182": {
    dni: "72049182",
    nombre: "Juan Carlos Pérez",
    telefono: "987654321",
    correo: "j.carlos@clinic.com"
  },
  "45812938": {
    dni: "45812938",
    nombre: "María Alejandra Gómez",
    telefono: "912345678",
    correo: "marialegomez@gmail.com"
  },
  "25401938": {
    dni: "25401938",
    nombre: "Lucas Santiago Rojas",
    telefono: "955667788",
    correo: "santiagorojas@outlook.com"
  },
  "88231920": {
    dni: "88231920",
    nombre: "Sofía Antonella Ruiz",
    telefono: "944552233",
    correo: "sofia.ruiz@gmail.com"
  }
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id_cita: "CIT001",
    id_paciente: "72049182",
    nombre_paciente: "Juan Carlos Pérez",
    id_especialista: "ESP01",
    fecha: "2026-06-23",
    hora: "09:00",
    sintomas_reportados: "Siento mucha tos con fiebre y malestar general desde ayer.",
    diagnostico_preliminar: "Infección Respiratoria Aguda",
    recomendacion_inicial: "Reposo absoluto, hidratación constante y evaluación de temperatura cada 4 horas.",
    estado: "Confirmada"
  },
  {
    id_cita: "CIT002",
    id_paciente: "45812938",
    nombre_paciente: "María Alejandra Gómez",
    id_especialista: "ESP04",
    fecha: "2026-06-23",
    hora: "11:30",
    sintomas_reportados: "Tengo una mancha roja en la piel que me causa picazón y tiene ronchas.",
    diagnostico_preliminar: "Dermatitis Cutánea Alérgica",
    recomendacion_inicial: "No aplicar cremas cosméticas sobre la zona afectada y evitar la exposición directa al sol.",
    estado: "Atendida"
  },
  {
    id_cita: "CIT003",
    id_paciente: "25401938",
    nombre_paciente: "Lucas Santiago Rojas",
    id_especialista: "ESP03",
    fecha: "2026-06-24",
    hora: "15:30",
    sintomas_reportados: "He tenido palpitaciones, taquicardia y sensación de presión alta.",
    diagnostico_preliminar: "Alteración Cardiovascular",
    recomendacion_inicial: "Evitar esfuerzos físicos inmediatos, mantener la calma y realizar un electrocardiograma de control.",
    estado: "Confirmada"
  },
  {
    id_cita: "CIT004",
    id_paciente: "88231920",
    nombre_paciente: "Sofía Antonella Ruiz",
    id_especialista: "ESP05",
    fecha: "2026-06-22",
    hora: "10:00",
    sintomas_reportados: "Me caí jugando tenis y me duele el tobillo, creo que es un esguince.",
    diagnostico_preliminar: "Lesión Músculoesquelética",
    recomendacion_inicial: "Inmovilizar la zona afectada, aplicar una compresa fría de forma local y evitar apoyar el miembro.",
    estado: "Atendida"
  },
  {
    id_cita: "CIT005",
    id_paciente: "72049182",
    nombre_paciente: "Juan Carlos Pérez",
    id_especialista: "ESP02",
    fecha: "2026-06-25",
    hora: "11:00",
    sintomas_reportados: "Dolor abdominal, diarrea leve y náuseas.",
    diagnostico_preliminar: "Gastroenteritis Intestinal",
    recomendacion_inicial: "Iniciar régimen de dieta blanda, priorizar soluciones de hidratación oral y evitar lácteos.",
    estado: "Confirmada"
  }
];

export function generarDiagnosticoPresuntivo(sintomasTexto: string) {
  const texto = sintomasTexto.toLowerCase().trim();

  if (!texto) {
    return {
      diagnostico: "Evaluación General Preventiva",
      recomendacion: "Síntomas no especificados. Se procederá con una revisión de rutina de signos vitales."
    };
  }

  // 1. Infección Respiratoria
  if (
    texto.includes("fiebre") ||
    texto.includes("tos") ||
    texto.includes("gripe") ||
    texto.includes("garganta") ||
    texto.includes("malestar") ||
    texto.includes("resfriado")
  ) {
    return {
      diagnostico: "Infección Respiratoria Aguda",
      recomendacion: "Reposo absoluto, hidratación constante y evaluación de temperatura cada 4 horas."
    };
  }

  // 2. Cardiovascular
  if (
    texto.includes("pecho") ||
    texto.includes("corazon") ||
    texto.includes("corazón") ||
    texto.includes("palpitaciones") ||
    texto.includes("presion alta") ||
    texto.includes("presión alta") ||
    texto.includes("taquicardia")
  ) {
    return {
      diagnostico: "Alteración Cardiovascular",
      recomendacion: "Evitar esfuerzos físicos inmediatos, mantener la calma y realizar un electrocardiograma de control."
    };
  }

  // 3. Dermatológico
  if (
    texto.includes("mancha") ||
    texto.includes("roncha") ||
    texto.includes("ronchas") ||
    texto.includes("alergia") ||
    texto.includes("picazon") ||
    texto.includes("picazón") ||
    texto.includes("piel")
  ) {
    return {
      diagnostico: "Dermatitis Cutánea Alérgica",
      recomendacion: "No aplicar cremas cosméticas sobre la zona afectada y evitar la exposición directa al sol."
    };
  }

  // 4. Músculoesquelético
  if (
    texto.includes("dolor de espalda") ||
    texto.includes("hueso") ||
    texto.includes("huesos") ||
    texto.includes("fractura") ||
    texto.includes("tobillo") ||
    texto.includes("golpe") ||
    texto.includes("rodilla") ||
    texto.includes("esguince")
  ) {
    return {
      diagnostico: "Lesión Músculoesquelética",
      recomendacion: "Inmovilizar la zona afectada, aplicar una compresa fría de forma local y evitar apoyar el miembro."
    };
  }

  // 5. Gastroenteritis
  if (
    texto.includes("estomago") ||
    texto.includes("estómago") ||
    texto.includes("diarrea") ||
    texto.includes("vomito") ||
    texto.includes("vómito") ||
    texto.includes("nauseas") ||
    texto.includes("náuseas") ||
    texto.includes("dolor abdominal")
  ) {
    return {
      diagnostico: "Gastroenteritis Intestinal",
      recomendacion: "Iniciar régimen de dieta blanda, priorizar soluciones de hidratación oral y evitar lácteos."
    };
  }

  // Default
  return {
    diagnostico: "Sintomatología Inespecífica",
    recomendacion: "El especialista realizará una anamnesis completa en el consultorio para determinar la patología."
  };
}
