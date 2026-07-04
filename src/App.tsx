/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  INITIAL_SPECIALISTS, 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS 
} from './data';
import { Specialist, Patient, Appointment, ActiveTab } from './types';
import Dashboard from './components/Dashboard';
import AppointmentForm from './components/AppointmentForm';
import AppointmentList from './components/AppointmentList';
import SpecialistsGrid from './components/SpecialistsGrid';

import { 
  Activity, 
  Calendar, 
  Users, 
  UserRound, 
  FileSpreadsheet, 
  Stethoscope, 
  Bell, 
  User,
  HeartPulse,
  LogOut,
  Sparkles,
  Database
} from 'lucide-react';

const LOCAL_STORAGE_KEY_CITAS = 'agenda_citas_datos';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Core active states synchronized to simulated backend storage
  const [specialists, setSpecialists] = useState<Record<string, Specialist>>(INITIAL_SPECIALISTS);
  const [patients, setPatients] = useState<Record<string, Patient>>(INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Notifications or toast alerts
  const [toastAlert, setToastAlert] = useState<{ message: string; type: 'success' | 'indigo' | 'error' } | null>(null);

  // 1. Initialize data from localStorage or fallback
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY_CITAS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.specialists && parsed.patients && parsed.appointments) {
          setSpecialists(parsed.specialists);
          setPatients(parsed.patients);
          setAppointments(parsed.appointments);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not load local storage", e);
    }
    
    // Default fallback integration
    setSpecialists(INITIAL_SPECIALISTS);
    setPatients(INITIAL_PATIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
  }, []);

  // 2. Persists structure changes to simulated storage
  const triggerStorageUpdate = (
    updatedSpecialists: Record<string, Specialist>,
    updatedPatients: Record<string, Patient>,
    updatedAppointments: Appointment[]
  ) => {
    try {
      const dataToSave = {
        specialists: updatedSpecialists,
        patients: updatedPatients,
        appointments: updatedAppointments
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_CITAS, JSON.stringify(dataToSave));
    } catch (err) {
      console.error("Local Storage write failed", err);
    }
  };

  // Toast notifier helper
  const showToast = (message: string, type: 'success' | 'indigo' | 'error' = 'success') => {
    setToastAlert({ message, type });
    setTimeout(() => {
      setToastAlert(null);
    }, 4500);
  };

  // 3. Business rule functions
  const handleRegisterPatient = (newPatient: Patient) => {
    const updatedPatients = {
      ...patients,
      [newPatient.dni]: newPatient
    };
    setPatients(updatedPatients);
    triggerStorageUpdate(specialists, updatedPatients, appointments);
  };

  const handleScheduleAppointment = (newApp: Appointment) => {
    const updatedAppointments = [newApp, ...appointments];
    setAppointments(updatedAppointments);
    triggerStorageUpdate(specialists, patients, updatedAppointments);
    showToast(`¡Cita ${newApp.id_cita} agendada y registrada clínicamente con éxito!`, 'success');
  };

  const handleCancelAppointment = (id_cita: string) => {
    const updatedAppointments = appointments.map(app => {
      if (app.id_cita === id_cita) {
        return { ...app, estado: 'Cancelada' as const };
      }
      return app;
    });
    setAppointments(updatedAppointments);
    triggerStorageUpdate(specialists, patients, updatedAppointments);
    showToast(`Cita ${id_cita} ha sido cancelada. El espacio fue liberado.`, 'error');
  };

  const handleReprogramAppointment = (id_cita: string, fecha: string, hora: string) => {
    const updatedAppointments = appointments.map(app => {
      if (app.id_cita === id_cita) {
        return { ...app, fecha, hora, estado: 'Confirmada' as const };
      }
      return app;
    });
    setAppointments(updatedAppointments);
    triggerStorageUpdate(specialists, patients, updatedAppointments);
    showToast(`Cita ${id_cita} reprogramada exitosamente para el ${fecha} a las ${hora}.`, 'indigo');
  };

  const handleMassAsistMassive = (fecha: string) => {
    let count = 0;
    const updatedAppointments = appointments.map(app => {
      if (app.fecha === fecha && app.estado === 'Confirmada') {
        count++;
        return { ...app, estado: 'Atendida' as const };
      }
      return app;
    });

    if (count > 0) {
      setAppointments(updatedAppointments);
      triggerStorageUpdate(specialists, patients, updatedAppointments);
      showToast(`Cierre de Jornada: ${count} citas actualizadas a estado "Atendida" para el ${fecha}.`, 'success');
      return { exito: true, mensaje: 'Proceso masivo completado', count };
    }
    
    return { exito: false, mensaje: 'No hay citas modificables', count: 0 };
  };

  // Real client-side Excel binary exporter (using SheetJS xlsx) replicating Pandas format
  const handleExportToExcel = () => {
    if (appointments.length === 0) {
      showToast("No hay registros de citas para exportar en el sistema.", "error");
      return;
    }

    // Header column names in strict required order
    const headers = [
      "Código Cita",
      "DNI Paciente",
      "Nombre Paciente",
      "Médico Especialista",
      "Fecha",
      "Hora",
      "Síntomas",
      "Diagnóstico Inteligente",
      "Estado Actual"
    ];

    // Rows mapping with exact requirements
    const rows = appointments.map(app => {
      // Nombre Paciente lookup (trimmed)
      const patient = patients[app.id_paciente];
      const patientName = patient ? patient.nombre.trim() : "No Registrado";

      // Médico Especialista lookup (trimmed)
      const doc = specialists[app.id_especialista];
      const docName = doc ? doc.nombre.trim() : `Dr. / Dra. ${app.id_especialista}`;

      // Síntomas formatting and cleanup
      const rawSymptoms = app.sintomas_reportados ? app.sintomas_reportados.trim() : "";
      const symptoms = rawSymptoms || "Ninguno especificado";

      const rawDiag = app.diagnostico_preliminar ? app.diagnostico_preliminar.trim() : "";
      const diagnostic = rawDiag || "No evaluado";

      return {
        "Código Cita": app.id_cita,
        "DNI Paciente": app.id_paciente,
        "Nombre Paciente": patientName,
        "Médico Especialista": docName,
        "Fecha": app.fecha,
        "Hora": app.hora,
        "Síntomas": symptoms,
        "Diagnóstico Inteligente": diagnostic,
        "Estado Actual": app.estado
      };
    });

    try {
      // Create SheetJS Worksheet
      const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
      
      // Auto-fit column widths for premium UX and perfect grid readability
      const maxColWidths = headers.map(header => {
        let maxLen = header.length;
        rows.forEach(row => {
          const val = String((row as any)[header] || "");
          if (val.length > maxLen) {
            maxLen = val.length;
          }
        });
        return { wch: Math.min(maxLen + 3, 50) };
      });
      worksheet['!cols'] = maxColWidths;

      // Create SheetJS Workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte de Citas");

      // Write and download xlsx file with precise naming convention required
      XLSX.writeFile(workbook, "Reporte_Citas_Medicas.xlsx");
      showToast("Su archivo Reporte_Citas_Medicas.xlsx se descargó con éxito.", "success");
    } catch (error) {
      console.error("SheetJS export failed:", error);
      showToast("Error al exportar a Excel.", "error");
    }
  };

  // Reset database to initial state trigger (convenient diagnostic playground)
  const handleResetDatabase = () => {
    if (window.confirm("¿Está seguro de que desea restablecer la base de datos a los valores de muestra iniciales? Esto borrará sus registros cargados actualmente.")) {
      setSpecialists(INITIAL_SPECIALISTS);
      setPatients(INITIAL_PATIENTS);
      setAppointments(INITIAL_APPOINTMENTS);
      triggerStorageUpdate(INITIAL_SPECIALISTS, INITIAL_PATIENTS, INITIAL_APPOINTMENTS);
      showToast("Base de datos clínica restablecida a valores por defecto.", 'indigo');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      
      {/* Header Clinical Premium Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Logo & Clinical brand title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7] hover:rotate-6 transition-all duration-300 flex items-center justify-center text-white shadow-xs shadow-sky-400/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-bold text-2xl italic text-slate-900 block leading-tight">
                Sani<span className="text-[#0284c7]">Smart</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 font-semibold tracking-wider">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                CLINICAL MANAGEMENT V4.3
              </span>
            </div>
          </div>

          {/* User Email & system date badge */}
          <div className="hidden sm:flex items-center gap-4">
            
            {/* System local status check */}
            <div className="p-1 px-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 text-[10px] font-mono font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LOG: ONLINE DB</span>
            </div>

            {/* User Profile Info */}
            <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-800 block">pepitosama45@gmail.com</span>
                <span className="text-[9px] text-[#0284c7] font-bold uppercase tracking-wider block">Ing. Software Médico</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-300/40 shadow-xs">
                U
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar (Vertical pill list) */}
        <aside className="lg:w-64 shrink-0 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3">
                Módulos de Negocio
              </span>
              <nav className="space-y-1">
                
                {/* 1. Dashboard Tab button */}
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left py-3 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                    activeTab === 'dashboard'
                      ? 'bg-[#0284c7] text-white shadow-xs shadow-sky-400/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-100/80'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4" />
                    Métricas e Informes
                  </span>
                  {activeTab === 'dashboard' && <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />}
                </button>

                {/* 2. New Appointment Registry Tab button */}
                <button
                  type="button"
                  onClick={() => setActiveTab('agendar')}
                  className={`w-full text-left py-3 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                    activeTab === 'agendar'
                      ? 'bg-[#0284c7] text-white shadow-xs shadow-sky-400/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-100/80'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4" />
                    Agendar Nueva Cita
                  </span>
                  <span className="text-[10px] bg-sky-100 text-sky-700 font-bold px-1.5 py-0.5 rounded-sm">
                    AI
                  </span>
                </button>

                {/* 3. Existing Appointments Table Tab button */}
                <button
                  type="button"
                  onClick={() => setActiveTab('citas')}
                  className={`w-full text-left py-3 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                    activeTab === 'citas'
                      ? 'bg-[#0284c7] text-white shadow-xs shadow-sky-400/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-100/80'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    Citas y Reprogramación
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                    {appointments.length}
                  </span>
                </button>

                {/* 4. Specialists list team Tab button */}
                <button
                  type="button"
                  onClick={() => setActiveTab('especialistas')}
                  className={`w-full text-left py-3 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                    activeTab === 'especialistas'
                      ? 'bg-[#0284c7] text-white shadow-xs shadow-sky-400/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-100/80'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <UserRound className="w-4 h-4" />
                    Especialistas Activos
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md">
                    5
                  </span>
                </button>

              </nav>
            </div>

            {/* Quick action buttons block */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Base de Datos y Datos Excel
              </span>
              <button
                type="button"
                onClick={handleExportToExcel}
                className="w-full bg-[#0284c7]/5 hover:bg-[#0284c7]/10 text-[#0284c7] py-2.5 px-3 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-2 cursor-pointer border border-[#0284c7]/10"
              >
                <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                Exportar Historial
              </button>
              <button
                type="button"
                onClick={handleResetDatabase}
                className="w-full bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/50 hover:border-rose-200 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Database className="w-4 h-4" />
                Reiniciar Servidor
              </button>
            </div>
          </div>

          {/* Copyright branding label */}
          <div className="text-center py-6 lg:py-0 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
            <span>VITE + REACT 19 • LATAM 2026</span>
          </div>
        </aside>

        {/* Dynamic Panel Content Stage */}
        <section className="flex-1 min-w-0 bg-transparent">
          
          {/* Active rendering view switch */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              appointments={appointments}
              specialists={specialists}
              patients={patients}
              onExportExcel={handleExportToExcel}
              onNavigateToForm={() => setActiveTab('agendar')}
            />
          )}

          {activeTab === 'agendar' && (
            <AppointmentForm 
              specialists={specialists}
              patients={patients}
              onRegisterPatient={handleRegisterPatient}
              onScheduleAppointment={handleScheduleAppointment}
              onNavigateToHistory={() => setActiveTab('citas')}
            />
          )}

          {activeTab === 'citas' && (
            <AppointmentList 
              appointments={appointments}
              specialists={specialists}
              onCancelAppointment={handleCancelAppointment}
              onReprogramAppointment={handleReprogramAppointment}
              onMassAsistMassive={handleMassAsistMassive}
            />
          )}

          {activeTab === 'especialistas' && (
            <SpecialistsGrid 
              specialists={specialists}
              onSelectSpecialistForBooking={(doctorCode) => {
                // Focus doctors selection inside scheduling form
                setActiveTab('agendar');
                // Select in UI handled via AppointmentForm initial state
              }}
            />
          )}

        </section>

      </main>

      {/* FLOATING GENERAL TOAST NOTIFICATION banner */}
      {toastAlert && (
        <div className="fixed bottom-6 right-6 z-50 p-4 max-w-sm rounded-2xl shadow-xl flex items-start gap-3 border animate-slide-in bg-white border-slate-100 text-slate-800">
          <div className={`p-1.5 rounded-lg text-white ${
            toastAlert.type === 'success' ? 'bg-emerald-500' : toastAlert.type === 'error' ? 'bg-rose-500' : 'bg-[#0284c7]'
          }`}>
            <Bell className="w-4 h-4 animate-swing" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Notificación de Sanitex</span>
            <p className="text-xs font-medium text-slate-700 leading-relaxed">
              {toastAlert.message}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
