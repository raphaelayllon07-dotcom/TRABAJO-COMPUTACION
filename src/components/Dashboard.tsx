import React, { useState } from 'react';
import { Appointment, Specialist, Patient } from '../types';
import { 
  Calendar, 
  Users, 
  UserRound, 
  Activity, 
  FileSpreadsheet, 
  TrendingUp, 
  Award, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface DashboardProps {
  appointments: Appointment[];
  specialists: Record<string, Specialist>;
  patients: Record<string, Patient>;
  onExportExcel: () => void;
  onNavigateToForm: () => void;
}

export default function Dashboard({ 
  appointments, 
  specialists, 
  patients, 
  onExportExcel,
  onNavigateToForm
}: DashboardProps) {
  const [hoveredBar, setHoveredBar] = useState<{ type: 'specialist' | 'diagnostic', key: string, value: number } | null>(null);

  // 1. Calculate Metrics
  const totalAppointments = appointments.length;
  const uniquePatientsCount = Object.keys(patients).length;
  const activeSpecialistsCount = Object.keys(specialists).length;
  const completedAppointments = appointments.filter(a => a.estado === 'Atendida').length;
  const confirmedAppointments = appointments.filter(a => a.estado === 'Confirmada').length;
  const cancelledAppointments = appointments.filter(a => a.estado === 'Cancelada').length;

  // 2. Specialty/Specialist distribution
  const specialistCounts: Record<string, number> = {};
  appointments.forEach(app => {
    if (app.estado !== 'Cancelada') {
      const specName = specialists[app.id_especialista]?.nombre || app.id_especialista;
      specialistCounts[specName] = (specialistCounts[specName] || 0) + 1;
    }
  });

  // Ensure all specialists have a record even if 0
  Object.values(specialists).forEach(spec => {
    if (!specialistCounts[spec.nombre]) {
      specialistCounts[spec.nombre] = 0;
    }
  });

  // 3. Pathology incidence
  const pathologyCounts: Record<string, number> = {};
  appointments.forEach(app => {
    if (app.estado !== 'Cancelada' && app.diagnostico_preliminar) {
      const diag = app.diagnostico_preliminar;
      pathologyCounts[diag] = (pathologyCounts[diag] || 0) + 1;
    }
  });

  // Sort specialists for chart
  const specialistChartData = Object.entries(specialistCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Sort pathologies for chart
  const pathologyChartData = Object.entries(pathologyCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const maxSpecCount = Math.max(...specialistChartData.map(d => d.count), 1);
  const maxPathCount = Math.max(...pathologyChartData.map(d => d.count), 1);

  // 4. Recurrent Patient Analytical Insight
  const patientAppointmentFrequency: Record<string, number> = {};
  appointments.forEach(app => {
    patientAppointmentFrequency[app.id_paciente] = (patientAppointmentFrequency[app.id_paciente] || 0) + 1;
  });

  let maxPatientDni = '';
  let maxPatientCount = 0;
  Object.entries(patientAppointmentFrequency).forEach(([dni, count]) => {
    if (count > maxPatientCount) {
      maxPatientCount = count;
      maxPatientDni = dni;
    }
  });

  const topPatient = patients[maxPatientDni];

  return (
    <div className="space-y-8" id="dashboard-tab">
      {/* Header and Quick action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold italic tracking-tight text-slate-900">
            Panel de <span className="text-[#0284c7]">Control Médico</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 italic">
            Métricas clínicas en tiempo real, diagnósticos asistidos y analítica del consultorio.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onExportExcel}
            id="btn-exportar-excel"
            className="inline-flex items-center gap-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 py-2.5 px-4 rounded-xl text-xs font-medium cursor-pointer transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Descargar Reporte Excel
          </button>
          <button
            onClick={onNavigateToForm}
            id="btn-agendar-dashboard"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-xs shadow-sky-100"
          >
            <Calendar className="w-4 h-4" />
            Nueva Cita Clínica
          </button>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Citas */}
        <div className="p-6 bg-white border border-slate-100/80 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[120px] transition-all hover:shadow-md hover:border-slate-200/60">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Citas</span>
              <div className="text-3xl font-bold text-slate-900 font-display italic mt-1">{totalAppointments}</div>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 pt-2 border-t border-slate-50">
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              100%
            </span>
            <span className="italic">citas registradas</span>
          </div>
        </div>

        {/* Pacientes Registrados */}
        <div className="p-6 bg-white border border-slate-100/80 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[120px] transition-all hover:shadow-md hover:border-slate-200/60">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pacientes Únicos</span>
              <div className="text-3xl font-bold text-slate-900 font-display italic mt-1">{uniquePatientsCount}</div>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-50 italic">
            Pacientes con historia clínica activa
          </div>
        </div>

        {/* Especialistas Activos */}
        <div className="p-6 bg-white border border-slate-100/80 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[120px] transition-all hover:shadow-md hover:border-slate-200/60">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Médicos Especialistas</span>
              <div className="text-3xl font-bold text-slate-900 font-display italic mt-1">{activeSpecialistsCount}</div>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <UserRound className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-50 italic">
            Plana médica completa activa
          </div>
        </div>

        {/* Citas Atendidas / Eficiencia */}
        <div className="p-6 bg-white border border-slate-100/80 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[120px] transition-all hover:shadow-md hover:border-slate-200/60">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tasa de Atención</span>
              <div className="text-3xl font-bold text-slate-900 font-display italic mt-1">
                {totalAppointments > 0 
                  ? Math.round((completedAppointments / totalAppointments) * 100) 
                  : 0}%
              </div>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-3 pt-2 border-t border-slate-50">
            <span className="font-semibold text-emerald-700">{completedAppointments} Atendidas</span>
            <span>• {confirmedAppointments} Espera</span>
            {cancelledAppointments > 0 && <span className="text-rose-500">• {cancelledAppointments} Canc.</span>}
          </div>
        </div>
      </div>

      {/* Sección Analítica: Gráficos de Distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Distribución por Especialista */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-bold italic text-slate-800">Volumen de Pacientes por Médico</h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribución de citas agendadas por especialista clínico (Excluye Canceladas)</p>
            </div>
            <span className="text-[10px] font-medium uppercase font-mono px-2 py-1 bg-sky-50 text-sky-700 rounded-sm">
              médicos activos
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {specialistChartData.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No hay datos de citas clínicas activos en este momento.
              </div>
            ) : (
              specialistChartData.map((item) => {
                const percentage = (item.count / maxSpecCount) * 100;
                return (
                  <div 
                    key={item.name} 
                    className="group space-y-1 cursor-pointer"
                    onMouseEnter={() => setHoveredBar({ type: 'specialist', key: item.name, value: item.count })}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                        {item.name}
                      </span>
                      <span className="font-mono text-slate-500 group-hover:text-sky-600 font-semibold">
                        {item.count} {item.count === 1 ? 'paciente' : 'pacientes'}
                      </span>
                    </div>
                    <div className="h-7 w-full bg-slate-50 rounded-lg overflow-hidden flex items-center relative p-1">
                      <div 
                        className="h-full bg-sky-500/85 hover:bg-sky-500 group-hover:shadow-xs rounded-md transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                      {hoveredBar?.type === 'specialist' && hoveredBar.key === item.name && (
                        <div className="absolute right-3 text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-sm">
                          {Math.round((item.count / (totalAppointments || 1)) * 100)}% de citas
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gráfico 2: Diagnósticos Preliminares */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-bold italic text-slate-800">Incidencia de Patologías Detectadas</h3>
              <p className="text-xs text-slate-400 mt-0.5">Diagnósticos presuntivos automáticos analizados a través de los síntomas</p>
            </div>
            <span className="text-[10px] font-medium uppercase font-mono px-2 py-1 bg-emerald-50 text-emerald-700 rounded-sm">
              patologías
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {pathologyChartData.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No hay diagnósticos detectados. Agende citas con síntomas.
              </div>
            ) : (
              pathologyChartData.map((item) => {
                const percentage = (item.count / maxPathCount) * 100;
                return (
                  <div 
                    key={item.name} 
                    className="group space-y-1 cursor-pointer"
                    onMouseEnter={() => setHoveredBar({ type: 'diagnostic', key: item.name, value: item.count })}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                        {item.name}
                      </span>
                      <span className="font-mono text-slate-500 group-hover:text-emerald-600 font-semibold">
                        {item.count} {item.count === 1 ? 'caso' : 'casos'}
                      </span>
                    </div>
                    <div className="h-7 w-full bg-slate-50 rounded-lg overflow-hidden flex items-center relative p-1">
                      <div 
                        className="h-full bg-emerald-500/85 hover:bg-emerald-500 rounded-md transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                      {hoveredBar?.type === 'diagnostic' && hoveredBar.key === item.name && (
                        <div className="absolute right-3 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                          {Math.round((item.count / (totalAppointments || 1)) * 100)}% de incidencia
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recurrent Patient & Clinical Advisor Insight Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Recurrent Patient Card status */}
        <div className="md:col-span-2 p-6 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-900 text-white rounded-2xl shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/15 border border-sky-500/25 text-sky-400 rounded-full text-xs font-semibold">
                <Award className="w-3.5 h-3.5" />
                Detección de Alta Frecuencia (Análisis QA)
              </div>
              
              <div className="space-y-1">
                <h3 className="text-2xl font-display font-bold italic text-white/95">
                  Paciente más Recurrente detectado
                </h3>
                <p className="text-xs text-slate-300">
                  Monitoreo predictivo de pacientes que registran mayor volumen de interacciones para seguimiento personalizado.
                </p>
              </div>

              {topPatient ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">Paciente</div>
                    <div className="text-sm font-semibold text-white mt-0.5">{topPatient.nombre}</div>
                    <div className="text-xs text-slate-300 font-mono mt-0.5">DNI {topPatient.dni}</div>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">Total Consultas</div>
                    <div className="text-lg font-bold text-sky-400 mt-0.5">{maxPatientCount} asistencias</div>
                    <div className="text-xs text-emerald-400 font-medium mt-0.5">Seguimiento óptimo</div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 pt-2">
                  No hay registro de pacientes con consultas frecuentes por el momento.
                </div>
              )}
            </div>
            
            <div className="hidden lg:flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl w-40 text-center">
              <div className="p-3 bg-sky-600 rounded-full text-white mb-2 shadow-sm shadow-sky-500/20">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-xs font-semibold">Salud Monitoreada</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Frecuencias OK</div>
            </div>
          </div>
        </div>

        {/* Clinical Advisory Quick Note */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <span>Aviso de Diagnóstico</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              El diagnóstico automático preliminar provee guía semántica referencial en base a síntomas ingresados, pero **no reemplaza** el juicio clínico ni la anamnesis completa de un profesional colegiado.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">REGLAS CLÍNICAS V1.0</span>
            <div className="flex gap-1 text-slate-400">
              <HelpCircle className="w-4 h-4 cursor-help" title="Fiebre, Pecho, Alergias, Dolor de Espalda, Estómago procesados" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
