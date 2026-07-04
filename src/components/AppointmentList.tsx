import React, { useState } from 'react';
import { Appointment, Specialist } from '../types';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  XCircle, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet,
  Grid,
  CalendarCheck
} from 'lucide-react';

interface AppointmentListProps {
  appointments: Appointment[];
  specialists: Record<string, Specialist>;
  onCancelAppointment: (id_cita: string) => void;
  onReprogramAppointment: (id_cita: string, fecha: string, hora: string) => void;
  onMassAsistMassive: (fecha: string) => { exito: boolean; mensaje: string; count: number };
}

export default function AppointmentList({
  appointments,
  specialists,
  onCancelAppointment,
  onReprogramAppointment,
  onMassAsistMassive
}: AppointmentListProps) {
  // Query & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<string>('all');
  const [filterSpecialist, setFilterSpecialist] = useState<string>('all');

  // Reprogram modal / inline state
  const [reprogramTarget, setReprogramTarget] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newHour, setNewHour] = useState('');
  const [reprogramError, setReprogramError] = useState('');

  // Mass close state
  const [massCloseDate, setMassCloseDate] = useState('');
  const [massCloseFeedback, setMassCloseFeedback] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // 1. Filtered appointments
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = 
      app.nombre_paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id_paciente.includes(searchTerm) ||
      app.id_cita.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesState = filterState === 'all' ? true : app.estado === filterState;

    const specialistName = specialists[app.id_especialista]?.nombre || '';
    const matchesSpecialist = filterSpecialist === 'all' 
      ? true 
      : (app.id_especialista === filterSpecialist || specialistName.toLowerCase().includes(filterSpecialist.toLowerCase()));

    return matchesSearch && matchesState && matchesSpecialist;
  });

  // Handle opening reprogram control
  const handleOpenReprogram = (app: Appointment) => {
    setReprogramTarget(app);
    setNewDate(app.fecha);
    setNewHour(app.hora);
    setReprogramError('');
  };

  // Perform rescheduled saving
  const handleConfirmReprogram = () => {
    if (!reprogramTarget) return;
    setReprogramError('');

    if (!newDate) {
      setReprogramError('Por favor seleccione una nueva fecha.');
      return;
    }

    // Must not reprogram in past
    const todayStr = new Date().toISOString().split('T')[0];
    if (newDate < todayStr) {
      setReprogramError('No se pueden reprogramar citas para una fecha pasada.');
      return;
    }

    if (!newHour) {
      setReprogramError('Por favor seleccione una hora.');
      return;
    }

    // Check collision for the same specialist at same date/hour (excluding this appointment)
    const collision = appointments.find(app => 
      app.id_especialista === reprogramTarget.id_especialista &&
      app.fecha === newDate &&
      app.hora === newHour &&
      app.id_cita !== reprogramTarget.id_cita &&
      app.estado === 'Confirmada'
    );

    if (collision) {
      setReprogramError(`El especialista ya cuenta con una cita agendada el ${newDate} a las ${newHour}.`);
      return;
    }

    // Apply reprogram
    onReprogramAppointment(reprogramTarget.id_cita, newDate, newHour);
    setReprogramTarget(null);
  };

  // Run mass atendida event
  const handleMassClose = (e: React.FormEvent) => {
    e.preventDefault();
    setMassCloseFeedback(null);

    if (!massCloseDate) {
      setMassCloseFeedback({
        type: 'info',
        message: 'Por favor seleccione una fecha válida para el procesamiento masivo.'
      });
      return;
    }

    const res = onMassAsistMassive(massCloseDate);
    if (res.exito && res.count > 0) {
      setMassCloseFeedback({
        type: 'success',
        message: `¡Cierre de jornada exitoso! ${res.count} citas actualizadas al estado "Atendida" para el día ${massCloseDate}.`
      });
    } else {
      setMassCloseFeedback({
        type: 'info',
        message: `No se encontraron citas en estado "Confirmada" programadas para el día ${massCloseDate}.`
      });
    }
  };

  return (
    <div className="space-y-8" id="citas-tab">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-bold italic tracking-tight text-slate-900">
          Gestión de <span className="text-[#0284c7]">Citas Registradas</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 italic">
          Busque pacientes, modifique o cancele citas pendientes, y simule cierres de jornada masivos.
        </p>
      </div>

      {/* Grid Layout: Appointments table & mass actions sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main section: Table of appointments (lg: col 9) */}
        <div className="lg:col-span-9 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
          
          {/* Filters Bar panel */}
          <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Direct text query */}
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Buscar por DNI, paciente o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs py-2.5 pl-9 pr-4 rounded-xl border border-slate-200 focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-sans"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Select status & specialists filters */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Specialist filter */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 py-1.5 px-3 rounded-xl text-xs text-slate-700">
                <span className="font-semibold text-slate-400">Médico:</span>
                <select
                  value={filterSpecialist}
                  onChange={(e) => setFilterSpecialist(e.target.value)}
                  className="focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Todos</option>
                  {Object.values(specialists).map(spec => (
                    <option key={spec.id} value={spec.id}>{spec.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 py-1.5 px-3 rounded-xl text-xs text-slate-700 font-sans">
                <span className="font-semibold text-slate-400">Estado:</span>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="Confirmada">Confirmadas</option>
                  <option value="Atendida">Atendidas</option>
                  <option value="Cancelada">Canceladas</option>
                </select>
              </div>

            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            {filteredAppointments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <AlertCircle className="w-8 h-8 text-slate-300" />
                <span>No se encontraron citas médicas con los criterios especificados.</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/20 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-50">
                    <th className="py-4 px-5">Código Cita</th>
                    <th className="py-4 px-5">Paciente Info</th>
                    <th className="py-4 px-5">Médico / Especialidad</th>
                    <th className="py-4 px-5">Fecha y Hora</th>
                    <th className="py-4 px-5">Diagnóstico Inteligente</th>
                    <th className="py-4 px-5">Estado</th>
                    <th className="py-4 px-5 text-right">Acciones Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                  {filteredAppointments.map((app) => {
                    const doctor = specialists[app.id_especialista];
                    
                    // State tag color map
                    let stateTagClass = 'bg-slate-150 text-slate-600 border-slate-200';
                    if (app.estado === 'Confirmada') {
                      stateTagClass = 'bg-sky-50 text-sky-700 border-sky-100';
                    } else if (app.estado === 'Atendida') {
                      stateTagClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    } else if (app.estado === 'Cancelada') {
                      stateTagClass = 'bg-rose-50 text-rose-600 border-rose-100';
                    }

                    return (
                      <tr key={app.id_cita} className="hover:bg-slate-50/40 transition-colors">
                        
                        {/* ID Code */}
                        <td className="py-4 px-5 font-mono font-bold text-slate-900">
                          {app.id_cita}
                        </td>
                        
                        {/* Patient */}
                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-800">{app.nombre_paciente}</div>
                          <div className="font-mono text-slate-400 text-[10px] mt-0.5">DNI {app.id_paciente}</div>
                        </td>

                        {/* Specialist */}
                        <td className="py-4 px-5">
                          <div className="font-medium text-slate-800">{doctor?.nombre || 'Desconocido'}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{doctor?.especialidad || 'Gral'}</div>
                        </td>

                        {/* Date and hour */}
                        <td className="py-4 px-5">
                          <div className="font-medium flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {app.fecha}
                          </div>
                          <div className="font-mono text-slate-400 text-[10px] mt-1 flex items-center gap-1.5 ml-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {app.hora} hs
                          </div>
                        </td>

                        {/* Presumed computed diagnostic */}
                        <td className="py-4 px-5 max-w-[180px]">
                          <span 
                            className="font-medium text-slate-800 block truncate" 
                            title={`${app.diagnostico_preliminar}: ${app.recomendacion_inicial}`}
                          >
                            {app.diagnostico_preliminar}
                          </span>
                          <span className="text-[9px] text-slate-400 italic block truncate mt-0.5">
                            {app.sintomas_reportados}
                          </span>
                        </td>

                        {/* Status Tag */}
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-[10px] border ${stateTagClass}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {app.estado}
                          </span>
                        </td>

                        {/* Quick actions triggers */}
                        <td className="py-4 px-5 text-right space-x-1.5">
                          {app.estado === 'Confirmada' ? (
                            <>
                              <button
                                onClick={() => handleOpenReprogram(app)}
                                title="Reprogramar fecha/hora"
                                className="inline-flex p-1.5 bg-slate-50 text-slate-600 hover:text-sky-600 hover:bg-sky-50 border border-slate-100 rounded-lg transition-all cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onCancelAppointment(app.id_cita)}
                                title="Cancelar Cita"
                                className="inline-flex p-1.5 bg-slate-50 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 rounded-lg transition-all cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] italic text-slate-400">Irreversible</span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Counter info */}
          <div className="p-4 bg-slate-50/20 border-t border-slate-50 text-[10px] text-slate-400 flex justify-between items-center">
            <span>Visualizando {filteredAppointments.length} de {appointments.length} citas registradas</span>
            <span className="font-mono">CLINIC DATABASE V4.3</span>
          </div>

        </div>

        {/* Sidebar: Mass Processing Atencion (lg: col 3) */}
        <div className="lg:col-span-3 space-y-6">
          
          <form onSubmit={handleMassClose} className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-900 shadow-md relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="p-2.5 bg-white/5 border border-white/10 w-fit rounded-xl text-sky-400 mb-3">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-display font-bold italic text-white">Cierre de Jornada</h3>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Procesamiento masivo para dar asistencia a todas las citas confirmadas de un día específico.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Seleccionar Fecha de Cierre</label>
              <input
                type="date"
                value={massCloseDate}
                onChange={(e) => setMassCloseDate(e.target.value)}
                className="w-full bg-white/5 border border-white/15 text-white/90 font-mono text-xs p-2.5 rounded-xl focus:border-sky-500 focus:outline-hidden transition-all cursor-pointer"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0284c7] hover:bg-sky-500 text-white py-2.5 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-all inline-flex items-center justify-center gap-1.5 shadow-sm shadow-[#0284c7]/20"
            >
              <CheckCircle className="w-4 h-4" />
              Ejecutar Cierre Masivo
            </button>

            {/* Mass feedback alerts */}
            {massCloseFeedback && (
              <div className={`p-3 rounded-xl text-[11px] leading-relaxed border ${
                massCloseFeedback.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                  : 'bg-white/5 border-white/10 text-slate-300'
              }`}>
                {massCloseFeedback.message}
              </div>
            )}
          </form>

          {/* Legend explanation card */}
          <div className="p-5 bg-white border border-slate-100 rounded-3xl text-xs space-y-3 shadow-xs">
            <h4 className="font-display font-bold italic text-slate-800">Leyenda de Estados</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <span className="font-medium text-slate-600 font-sans">Confirmada:</span>
                <span className="text-slate-400">Paciente en agenda por ser atendido.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-600 font-sans">Atendida:</span>
                <span className="text-slate-400">Consulta y diagnóstico completados.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="font-medium text-slate-600 font-sans">Cancelada:</span>
                <span className="text-slate-400">Espacio liberado e inactivo.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* REPROGRAM MODAL */}
      {reprogramTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 overflow-hidden shadow-2xl">
            <div className="p-6 md:p-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-50 text-[#0284c7] rounded-xl">
                  <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold italic text-slate-800">Reprogramar Cita Médica</h3>
                  <p className="text-[10px] text-slate-400 font-mono">CITA ID: {reprogramTarget.id_cita}</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-1.5">
                <div>
                  <span className="text-slate-400 font-medium">Paciente:</span>{' '}
                  <span className="font-bold text-slate-700">{reprogramTarget.nombre_paciente}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Especialista:</span>{' '}
                  <span className="font-semibold text-slate-700">
                    {specialists[reprogramTarget.id_especialista]?.nombre || reprogramTarget.id_especialista}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium font-sans">Horario anterior:</span>{' '}
                  <span className="font-mono text-slate-650 bg-slate-200/50 px-1.5 py-0.5 rounded-sm text-[10px]">
                    {reprogramTarget.fecha} a las {reprogramTarget.hora} hs
                  </span>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 block">Nueva Fecha</label>
                  <input
                    type="date"
                    value={newDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:outline-hidden text-slate-800 p-2.5 rounded-xl text-xs transition-all cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 block">Nueva Hora Escogible</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(specialists[reprogramTarget.id_especialista]?.horario || []).map((timeSlot) => {
                      const isSelected = newHour === timeSlot;
                      return (
                        <button
                          key={timeSlot}
                          type="button"
                          onClick={() => setNewHour(timeSlot)}
                          className={`py-1.5 text-center font-mono text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-600 border-sky-600 text-white'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {timeSlot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {reprogramError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-[10px] font-semibold flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                  <span>{reprogramError}</span>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setReprogramTarget(null)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 px-4 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Regresar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReprogram}
                  className="bg-[#0284c7] hover:bg-[#025684] text-white py-2.5 px-4 text-xs font-semibold rounded-xl cursor-pointer shadow-sm shadow-[#0284c7]/20"
                >
                  Guardar Reprogramación
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
