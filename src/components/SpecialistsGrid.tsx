import React from 'react';
import { Specialist } from '../types';
import { Stethoscope, Clock, Calendar, ShieldCheck, Heart, Users, Star } from 'lucide-react';

interface SpecialistsGridProps {
  specialists: Record<string, Specialist>;
  onSelectSpecialistForBooking: (id: string) => void;
}

export default function SpecialistsGrid({ specialists, onSelectSpecialistForBooking }: SpecialistsGridProps) {
  
  // Custom metadata about specialists to enrich the card profiles
  const profileDetails: Record<string, { image: string; reg: string; rate: string; docBio: string }> = {
    "ESP01": {
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
      reg: "CMP-48912",
      rate: "4.9",
      docBio: "Especialista en atención primaria y medicina preventiva familiar con más de 12 años de trayectoria."
    },
    "ESP02": {
      image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200",
      reg: "CMP-51293",
      rate: "4.8",
      docBio: "Experiencia dedicada a la salud infantil, control de crecimiento y pediatría del adolescente."
    },
    "ESP03": {
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
      reg: "CMP-32981",
      rate: "5.0",
      docBio: "Experto en ecocardiografía, manejo de hipertensión arterial y arritmias cardiovasculares."
    },
    "ESP04": {
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
      reg: "CMP-44120",
      rate: "4.7",
      docBio: "Especialista en dermatología estética y patológica, diagnóstico de nevos y alergias cutáneas."
    },
    "ESP05": {
      image: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=200",
      reg: "CMP-31029",
      rate: "4.9",
      docBio: "Tratamiento avanzado de fracturas de alta complejidad, lesiones articulares y esguinces deportivos."
    }
  };

  return (
    <div className="space-y-8" id="specialists-tab">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-bold italic tracking-tight text-slate-900">
          Staff de <span className="text-[#0284c7]">Especialistas Médicos</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 italic">
          Plana médica altamente calificada para su diagnóstico presuntivo y atención con citas agendadas.
        </p>
      </div>

      {/* Grid of Specialists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(specialists).map((spec) => {
          const detail = profileDetails[spec.id] || {
            image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
            reg: "CMP-XXXXX",
            rate: "4.8",
            docBio: "Médico especialista dedicado al cuidado clínico y diagnóstico preventivo."
          };

          return (
            <div 
              key={spec.id} 
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              {/* Doctor Header Profile */}
              <div className="flex items-start gap-4">
                <img 
                  referrerPolicy="no-referrer"
                  src={detail.image} 
                  alt={spec.nombre}
                  className="w-16 h-16 rounded-2xl object-cover object-center bg-slate-100 border border-slate-100 placeholder-doctor"
                />
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                    <Stethoscope className="w-3 h-3 text-[#0284c7]" />
                    {spec.especialidad}
                  </div>
                  <h3 className="font-display font-bold italic text-slate-800 text-sm md:text-base leading-snug">
                    {spec.nombre}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{detail.reg}</span>
                    <span className="flex items-center gap-0.5 font-sans font-bold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                      {detail.rate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio description */}
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                {detail.docBio}
              </p>

              {/* Doctor Horario list */}
              <div className="space-y-2 pt-2 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Horas de Consulta Agenda
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {spec.horario.map((hour) => (
                    <span 
                      key={hour} 
                      className="inline-block text-[10px] font-semibold font-mono bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                    >
                      {hour}
                    </span>
                  ))}
                </div>
              </div>

              {/* Booking Quick button */}
              <button
                onClick={() => onSelectSpecialistForBooking(spec.id)}
                className="w-full bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 text-slate-700 hover:text-sky-700 py-2.5 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-all inline-flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-sky-600" />
                Agendar con {spec.nombre.split(' ')[1]}
              </button>

            </div>
          );
        })}
      </div>

      {/* Safety standards info box */}
      <div className="p-6 bg-emerald-50/40 border border-emerald-100 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-100/50 text-emerald-700 rounded-full shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-semibold text-slate-800 text-sm">Estándares Médicos de Seguridad Garantizados</h4>
            <p className="text-xs text-slate-500 whitespace-normal leading-relaxed">
              Todos nuestros médicos especialistas se encuentran debidamente acreditados ante el Colegio Médico y cuentan con habilitaciones vigentes para teleconsulta y diagnóstico preventivo.
            </p>
          </div>
        </div>
        <div className="flex gap-4 items-center pl-9 sm:pl-0">
          <div className="text-center font-sans">
            <div className="text-lg font-bold text-slate-800">100%</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Acreditados</div>
          </div>
          <div className="text-center font-sans border-l border-emerald-200/50 pl-4">
            <div className="text-lg font-bold text-slate-800">24/7</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Soporte</div>
          </div>
        </div>
      </div>

    </div>
  );
}
