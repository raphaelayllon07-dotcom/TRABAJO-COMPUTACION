import React, { useState, useEffect } from 'react';
import { Specialist, Patient, Appointment } from '../types';
import { generarDiagnosticoPresuntivo } from '../data';
import { 
  User, 
  Phone, 
  Mail, 
  Layers, 
  Clock, 
  Calendar, 
  AlertCircle, 
  HeartHandshake, 
  Stethoscope, 
  CheckCircle,
  FileText,
  BookmarkCheck,
  Smile,
  ChevronsUpDown,
  Search
} from 'lucide-react';

interface AppointmentFormProps {
  specialists: Record<string, Specialist>;
  patients: Record<string, Patient>;
  onRegisterPatient: (patient: Patient) => void;
  onScheduleAppointment: (appointment: Appointment) => void;
  onNavigateToHistory: () => void;
}

export default function AppointmentForm({
  specialists,
  patients,
  onRegisterPatient,
  onScheduleAppointment,
  onNavigateToHistory
}: AppointmentFormProps) {
  // Candidate form inputs
  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');

  const [selectedSpecialistId, setSelectedSpecialistId] = useState('ESP01');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [sintomas, setSintomas] = useState('');

  // UX or internal state
  const [dniError, setDniError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isPatientPreExisting, setIsPatientPreExisting] = useState(false);

  // Diagnosis Modal/Card generated on submit
  const [preliminaryReport, setPreliminaryReport] = useState<{
    id_cita: string;
    paciente: Patient;
    especialista: Specialist;
    fecha: string;
    hora: string;
    sintomas: string;
    diagnostico: string;
    recomendacion: string;
    visible: boolean;
  } | null>(null);

  // Autofill patient query
  useEffect(() => {
    const cleanDni = dni.trim();
    if (cleanDni.length === 8) {
      if (/^\d{8}$/.test(cleanDni)) {
        setDniError('');
        const found = patients[cleanDni];
        if (found) {
          setNombre(found.nombre);
          setTelefono(found.telefono);
          setCorreo(found.correo);
          setIsPatientPreExisting(true);
        } else {
          // Reset patient names but let them register
          setNombre('');
          setTelefono('');
          setCorreo('');
          setIsPatientPreExisting(false);
        }
      } else {
        setDniError('El DNI debe tener exactamente 8 caracteres numéricos.');
        setIsPatientPreExisting(false);
      }
    } else {
      if (cleanDni.length > 0 && !/^\d+$/.test(cleanDni)) {
        setDniError('El DNI debe contener solo números.');
      } else if (cleanDni.length > 8) {
        setDniError('El DNI no puede exceder los 8 números.');
      } else {
        setDniError('');
      }
      setIsPatientPreExisting(false);
    }
  }, [dni, patients]);

  // Handle clinical appointment scheduling submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    // DNI check
    const cleanDni = dni.trim();
    if (!/^\d{8}$/.test(cleanDni)) {
      setDniError('El DNI debe constar de exactamente 8 dígitos.');
      return;
    }

    // Input fields check
    if (!nombre.trim() || !telefono.trim() || !correo.trim()) {
      setGeneralError('Por favor complete todos los datos personales del paciente.');
      return;
    }

    if (!selectedDate) {
      setGeneralError('Por favor seleccione una fecha clínica para la cita.');
      return;
    }

    // Date validation - must not be in past
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate < todayStr) {
      setGeneralError('No se pueden programar citas para una fecha pasada.');
      return;
    }

    if (!selectedHour) {
      setGeneralError('Por favor seleccione un horario disponible.');
      return;
    }

    if (!sintomas.trim()) {
      setGeneralError('Por favor describa brevemente los síntomas para el análisis preliminar.');
      return;
    }

    // Register or update patient
    const activePatient: Patient = {
      dni: cleanDni,
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      correo: correo.trim()
    };
    onRegisterPatient(activePatient);

    // Run semantic diagnosis rules onSymptoms
    const resultDoc = generarDiagnosticoPresuntivo(sintomas);

    const generatedId = `CIT${Math.floor(Math.random() * 900) + 100}`; // Random code just for presentation report
    const spec = specialists[selectedSpecialistId];

    // Trigger local interactive preliminary report preview before definitive save
    setPreliminaryReport({
      id_cita: generatedId,
      paciente: activePatient,
      especialista: spec,
      fecha: selectedDate,
      hora: selectedHour,
      sintomas: sintomas.trim(),
      diagnostico: resultDoc.diagnostico,
      recomendacion: resultDoc.recomendacion,
      visible: true
    });
  };

  const confirmReportAndSave = () => {
    if (!preliminaryReport) return;

    // Build complete appointment structure
    const newAppointment: Appointment = {
      id_cita: preliminaryReport.id_cita,
      id_paciente: preliminaryReport.paciente.dni,
      nombre_paciente: preliminaryReport.paciente.nombre,
      id_especialista: preliminaryReport.especialista.id,
      fecha: preliminaryReport.fecha,
      hora: preliminaryReport.hora,
      sintomas_reportados: preliminaryReport.sintomas,
      diagnostico_preliminar: preliminaryReport.diagnostico,
      recomendacion_inicial: preliminaryReport.recomendacion,
      estado: 'Confirmada'
    };

    onScheduleAppointment(newAppointment);
    setPreliminaryReport(null);

    // Reset fields
    setDni('');
    setNombre('');
    setTelefono('');
    setCorreo('');
    setSelectedHour('');
    setSintomas('');
    setIsPatientPreExisting(false);
  };

  const selectedSpecialist = specialists[selectedSpecialistId] || specialists['ESP01'];

  return (
    <div className="space-y-8" id="agendar-tab">
      
      {/* Header section */}
      <div>
        <h1 className="text-4xl font-display font-bold italic tracking-tight text-slate-900">
          Registro y <span className="text-[#0284c7]">Agenda de Citas</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 italic">
          Complete los datos del paciente, elija profesional clínico y analice síntomas en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulario Principal de Registro (lg: col 7) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          
          {/* Subtitle */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-50">
            <span className="w-1.5 h-6 bg-[#0284c7] rounded-full" />
            <span className="font-display font-bold italic text-slate-800 text-base">1. Credenciales y Datos del Paciente</span>
          </div>

          {/* DNI & Patient checks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">DNI del Paciente (8 dígitos)</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={8}
                  placeholder="Ej. 72049182"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                  className={`w-full bg-slate-50/50 hover:bg-slate-50 text-slate-800 font-mono text-sm py-2.5 pl-9 pr-4 rounded-xl border border-slate-200 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all ${
                    dniError ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-100' : ''
                  }`}
                  required
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {dniError && (
                <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-500" /> {dniError}
                </p>
              )}
              {isPatientPreExisting && (
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-500" /> Paciente pre-registrado cargado con éxito.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">Nombre Completo</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ej. Juan Carlos Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 text-slate-800 text-sm py-2.5 pl-9 pr-4 rounded-xl border border-slate-200 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                  required
                  disabled={isPatientPreExisting}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">Teléfono Móvil</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Ej. 987654321"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 text-slate-800 text-sm py-2.5 pl-9 pr-4 rounded-xl border border-slate-200 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                  required
                  disabled={isPatientPreExisting}
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">Correo Electrónico</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Ej. paciente@dominio.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 text-slate-800 text-sm py-2.5 pl-9 pr-4 rounded-xl border border-slate-200 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                  required
                  disabled={isPatientPreExisting}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Clincal selection Section */}
          <div className="flex items-center gap-2.5 pt-4 pb-2 border-b border-slate-50">
            <span className="w-1.5 h-6 bg-[#0284c7] rounded-full" />
            <span className="font-display font-bold italic text-slate-800 text-base">2. Selección de Especialista y Horario</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Specialist Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">Especialista Médico</label>
              <div className="relative">
                <select
                  value={selectedSpecialistId}
                  onChange={(e) => {
                    setSelectedSpecialistId(e.target.value);
                    setSelectedHour(''); // Reset hour when doctor changes
                  }}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 text-slate-800 text-sm py-2.5 pl-9 pr-8 rounded-xl border border-slate-200 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all appearance-none cursor-pointer"
                >
                  {Object.values(specialists).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre} ({item.especialidad})
                    </option>
                  ))}
                </select>
                <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <ChevronsUpDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Date Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">Fecha de la Cita</label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 text-slate-800 text-sm py-2.5 pl-9 pr-4 rounded-xl border border-slate-200 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                  required
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Dynamic Available Hours rendering */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 block">
              Horas de Consulta Disponibles ({selectedSpecialist.nombre})
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {selectedSpecialist.horario.map((time) => {
                const isSelected = selectedHour === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedHour(time)}
                    className={`py-2 px-1 text-center font-mono text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-600 border-sky-600 text-white shadow-xs shadow-sky-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptoms Details Required */}
          <div className="flex items-center gap-2.5 pt-4 pb-2 border-b border-slate-50">
            <span className="w-1.5 h-6 bg-[#0284c7] rounded-full" />
            <span className="font-display font-bold italic text-slate-800 text-base">3. Descripción de Síntomas o Malestares</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-500">¿Qué malestares reporta el paciente?</label>
              <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded-sm font-semibold">
                Análisis Inteligente Activo
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Ej. fiebre alta, dolor de garganta fuerte, tos seca o dolor de estómago, náuseas..."
              value={sintomas}
              onChange={(e) => setSintomas(e.target.value)}
              className="w-full bg-slate-50/50 hover:bg-slate-50 text-slate-800 text-sm p-3.5 rounded-2xl border border-slate-200 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all resize-none"
              required
            />
            <p className="text-[10px] text-slate-400 italic leading-relaxed">
              * El motor clínico evaluará palabras clave como fiebre, pecho, picazón, esguince o vómito para formular la sugerencia médica presunta.
            </p>
          </div>

          {/* Validation Warnings */}
          {generalError && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2 flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={onNavigateToHistory}
              className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 px-6 rounded-xl text-xs font-semibold transition-all border border-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white py-3 px-6 rounded-xl text-xs font-semibold transition-all shadow-xs shadow-sky-500/10 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              Agendar e Iniciar Diagnóstico
            </button>
          </div>

        </form>

        {/* Right Panel: Rules list & Live simulator preview (lg: col 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Rules Card Cheat Sheet */}
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-xs">
            <h3 className="text-base font-display font-bold italic text-slate-800 pb-3 border-b border-slate-50 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0284c7]" />
              Reglas de Diagnóstico Semántico
            </h3>
            
            <div className="space-y-3.5 pt-4 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="p-1 bg-amber-50 rounded-md text-amber-600 text-[10px] font-bold block whitespace-nowrap uppercase">
                  Resp
                </span>
                <div>
                  <span className="font-semibold text-slate-700 block">Infección Respiratoria</span>
                  <span className="text-slate-400 text-[10px]">fiebre, tos, gripe, garganta, malestar, resfriado</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="p-1 bg-rose-50 rounded-md text-rose-600 text-[10px] font-bold block whitespace-nowrap uppercase">
                  Cardio
                </span>
                <div>
                  <span className="font-semibold text-slate-700 block">Alteración Cardiovascular</span>
                  <span className="text-slate-400 text-[10px]">pecho, corazon, palpitaciones, presion alta, taquicardia</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="p-1 bg-emerald-50 rounded-md text-emerald-600 text-[10px] font-bold block whitespace-nowrap uppercase">
                  Derm
                </span>
                <div>
                  <span className="font-semibold text-slate-700 block">Dermatitis Cutánea Alérgica</span>
                  <span className="text-slate-400 text-[10px]">mancha, roncha, alergia, picazon, piel</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="p-1 bg-violet-50 rounded-md text-violet-600 text-[10px] font-bold block whitespace-nowrap uppercase">
                  Traum
                </span>
                <div>
                  <span className="font-semibold text-slate-700 block">Lesión Músculoesquelética</span>
                  <span className="text-slate-400 text-[10px]">espalda, hueso, fractura, tobillo, golpe, rodilla, esguince</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="p-1 bg-blue-50 rounded-md text-blue-600 text-[10px] font-bold block whitespace-nowrap uppercase">
                  Gastro
                </span>
                <div>
                  <span className="font-semibold text-slate-700 block">Gastroenteritis Intestinal</span>
                  <span className="text-slate-400 text-[10px]">estomago, diarrea, vomito, nauseas, dolor abdominal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time typing dynamic analyzer feedback */}
          <div className="p-6 bg-sky-50/50 border border-sky-100 rounded-3xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100/50 px-2 py-0.5 rounded-sm">
                Feedback en Vivo
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
            </div>

            {sintomas.trim().length > 3 ? (
              <div className="space-y-3">
                <div className="text-slate-700 text-xs">
                  Sintomatología capturada: <span className="font-medium italic">"{sintomas}"</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-sky-100/70 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Diagnóstico presuntivo calculado:</div>
                  <div className="text-xs font-bold text-sky-800">
                    {generarDiagnosticoPresuntivo(sintomas).diagnostico}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-relaxed pt-1.5 border-t border-slate-50">
                    <span className="font-bold text-slate-600 block">Recomendación:</span>
                    {generarDiagnosticoPresuntivo(sintomas).recomendacion}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5">
                <Smile className="w-5 h-5 text-sky-400" />
                <span>Empiece a redactar síntomas para simular el análisis en vivo.</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MODAL INFORME MEDICO PRELIMINAR */}
      {preliminaryReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full overflow-hidden shadow-2xl relative">
            
            {/* Stamp seal header decorative */}
            <div className="h-2.5 bg-sky-600" />
            
            <div className="p-6 md:p-8 space-y-6">
              {/* Doctor icon, Title & Code */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-sky-50 text-sky-600 rounded-full">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold italic text-slate-800">Informe Médico Preliminar</h3>
                    <p className="text-[10px] text-slate-400 font-mono">ID CITA: {preliminaryReport.id_cita} (PRE-REGISTRO)</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-100">
                  Procesado QA
                </span>
              </div>

              {/* Patient and session meta info */}
              <div className="bg-slate-50 p-4 rounded-2xl grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Paciente</span>
                  <span className="font-semibold text-slate-700 block mt-0.5">{preliminaryReport.paciente.nombre}</span>
                  <span className="font-mono text-slate-400 block">DNI {preliminaryReport.paciente.dni}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Médico Asignado</span>
                  <span className="font-semibold text-slate-700 block mt-0.5">{preliminaryReport.especialista.nombre}</span>
                  <span className="text-[10px] text-slate-400 block">{preliminaryReport.especialista.especialidad}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Fecha y Hora</span>
                  <span className="font-semibold text-[#0284c7] block mt-0.5">{preliminaryReport.fecha}</span>
                  <span className="font-mono text-[#0284c7] block">{preliminaryReport.hora} hs</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Estado Cita</span>
                  <span className="font-semibold text-emerald-600 block mt-0.5 flex items-center gap-0.5">
                    <BookmarkCheck className="w-3.5 h-3.5" /> Confirmada
                  </span>
                </div>
              </div>

              {/* Symptoms details */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sintomatología Reportada</h4>
                <div className="bg-slate-100/50 p-3 rounded-xl text-xs text-slate-700 italic border-l-2 border-slate-300">
                  "{preliminaryReport.sintomas}"
                </div>
              </div>

              {/* Intelligence results box */}
              <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-sky-800 block">Diagnóstico Presuntivo</span>
                  <div className="font-display font-semibold text-[#0284c7] text-base">
                    {preliminaryReport.diagnostico}
                  </div>
                </div>

                <div className="space-y-1 pt-2.5 border-t border-sky-100/65">
                  <span className="text-[10px] uppercase font-bold text-sky-800 block">Recomendación Inicial</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {preliminaryReport.recomendacion}
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-amber-700 text-center bg-amber-50 p-2 rounded-lg leading-relaxed">
                Este diagnóstico no sustituye la consulta formal y presencial. Se genera de manera estrictamente referencial mediante el procesamiento analítico de malestares.
              </p>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPreliminaryReport(null)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 px-4 text-xs font-semibold rounded-xl cursor-pointer transition-all"
                >
                  Modificar Cita
                </button>
                <button
                  type="button"
                  onClick={confirmReportAndSave}
                  className="bg-[#0284c7] hover:bg-[#025684] text-white py-2.5 px-5 text-xs font-semibold rounded-xl cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-sm shadow-[#0284c7]/20"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  Confirmar y Guardar Cita
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
