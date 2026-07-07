"use client";

import React, { useState, useMemo } from "react";

// Helpers de fecha (sin date-fns para no depender de la librería)
const DIAS_SEMANA = ["LU", "MA", "MI", "JU", "VI", "SÁ", "DO"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS_SEMANA_LARGO = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];

function formatFecha(date) {
  if (!date) return "";
  const dia = DIAS_SEMANA_LARGO[date.getDay()];
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)}, ${date.getDate()} de ${MESES[date.getMonth()]}`;
}

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// CONFIGURACIÓN CONSTANTE (Fuente de verdad)
const configAdmin = {
  anularDiaActual: false, // Cambiar a true para obligar a programar desde mañana
};

const WHATSAPP_NUMBER = "5491112345678"; // Reemplazar por el número de WhatsApp de destino (código de país + número, ej: 549...)
const PRECIO_BASE_GENERAL = 4000;
const PRECIO_KM_EXTRA = 400;

const ZONAS_FRECUENTES = [
  { id: "general", label: "No especificar / Otra zona", precio: 4000 },
  { id: "microcentro", label: "Microcentro / San Nicolás", precio: 3500 },
  { id: "palermo", label: "Palermo / Belgrano", precio: 4500 },
  { id: "vicente_lopez", label: "Vicente López / Olivos", precio: 5500 },
  { id: "san_martin", label: "San Martín / Caseros", precio: 6000 },
  { id: "san_isidro", label: "San Isidro", precio: 7000 },
];

const CATEGORIAS_BULTO = [
  {
    id: "sobre",
    label: "Sobre / Documentación",
    cargo: 0,
    desc: "Documentos, llaves o sobres planos",
  },
  {
    id: "chico",
    label: "Paquete Chico",
    cargo: 1000,
    desc: "Caja de zapatos, bolsa de ropa, etc.",
  },
  {
    id: "mediano",
    label: "Paquete Mediano",
    cargo: 2500,
    desc: "Caja hasta 40x40cm o mochila llena",
  },
];

// ─── COMPONENTE CALENDARIO CUSTOM ───────────────────────────────────────────
function MiniCalendar({ selected, onSelect }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // viewMonth = primer día del mes que se está mostrando
  const [viewYear, setViewYear]   = React.useState(selected ? selected.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(selected ? selected.getMonth()    : today.getMonth());

  // Límites: mes actual y mes siguiente
  const minYear  = today.getFullYear();
  const minMonth = today.getMonth();
  const maxYear  = minMonth === 11 ? minYear + 1 : minYear;
  const maxMonth = minMonth === 11 ? 0 : minMonth + 1;

  const canPrev = !(viewYear === minYear && viewMonth === minMonth);
  const canNext = !(viewYear === maxYear && viewMonth === maxMonth);

  function prevMonth() {
    if (!canPrev) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (!canNext) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  // Generar celdas del calendario (grid lunes-domingo)
  const cells = React.useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // día de la semana del primer día (0=Dom → ajustar a lun-dom)
    const startDow = (firstDay.getDay() + 6) % 7; // 0=Lun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const grid = [];
    // celdas vacías antes del día 1
    for (let i = 0; i < startDow; i++) grid.push(null);
    for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(viewYear, viewMonth, d));
    // rellenar hasta completar múltiplo de 7
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
  }, [viewYear, viewMonth]);

  return (
    <div className="bg-[#141414] border border-zinc-800/80 rounded-2xl p-4 w-full select-none">
      {/* Cabecera: mes y flechas */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed hover:enabled:bg-zinc-800 hover:enabled:text-zinc-100 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <span className="text-sm font-bold text-zinc-100 capitalize tracking-wide">
          {MESES[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          disabled={!canNext}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 disabled:opacity-20 disabled:cursor-not-allowed hover:enabled:bg-zinc-800 hover:enabled:text-zinc-100 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Días de semana */}
      <div className="grid grid-cols-7 mb-1">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-zinc-600 uppercase tracking-wider py-1">{d}</div>
        ))}
      </div>

      {/* Celdas de días */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;
          const isToday    = isSameDay(date, today);
          const isSelected = isSameDay(date, selected);
          const isPast     = date < today;
          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => onSelect(date)}
              className={[
                "relative h-9 w-full flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150",
                isPast     ? "text-zinc-700 cursor-not-allowed" : "cursor-pointer",
                isSelected ? "bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_12px_rgba(16,185,129,.35)]" : "",
                !isSelected && !isPast ? "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100" : "",
              ].join(" ")}
            >
              {date.getDate()}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Fecha seleccionada */}
      {selected && (
        <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-center gap-1.5">
          <span className="text-sm">📅</span>
          <span className="text-xs text-zinc-400">Programado para el:</span>
          <span className="text-xs font-semibold text-emerald-400">{formatFecha(selected)}</span>
        </div>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function CotizadorMotoenvios() {
  // ESTADOS DEL FORMULARIO
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [notas, setNotas] = useState("");
  const [zonaFrecuente, setZonaFrecuente] = useState("general");
  const [distanciaKm, setDistanciaKm] = useState(5);
  const [bultoId, setBultoId] = useState("sobre");
  
  // FECHA Y HORA DE PROGRAMACIÓN
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const defaultDate = useMemo(() => {
    if (configAdmin.anularDiaActual) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow;
    }
    return today;
  }, []);

  const [fechaEnvio, setFechaEnvio] = useState(defaultDate);
  const [horaInicio, setHoraInicio] = useState("Lo antes posible (Ya mismo)");

  // ADICIONALES
  const [esIdaYVuelta, setEsIdaYVuelta] = useState(false);
  const [tramiteEspera, setTramiteEspera] = useState("ninguno"); // "ninguno" | "corto" | "largo"

  // PAGO Y LOGÍSTICA
  const [lugarPago, setLugarPago] = useState("retiro"); // "retiro" | "entrega"
  const [medioPago, setMedioPago] = useState("efectivo"); // "efectivo" | "transferencia"

  // ERRORES DE VALIDACIÓN
  const [errors, setErrors] = useState({
    nombre: false,
    origen: false,
    destino: false,
  });

  // CONFIGURACIÓN DE FECHAS DESHABILITADAS
  const disabledDays = useMemo(() => {
    const matchers = [{ before: startOfToday }];
    if (configAdmin.anularDiaActual) {
      matchers.push(startOfToday);
    }
    return matchers;
  }, []);

  // ENCONTRAR CONFIGURACIÓN SELECCIONADA
  const zonaSeleccionada = useMemo(() => {
    return ZONAS_FRECUENTES.find((z) => z.id === zonaFrecuente) || ZONAS_FRECUENTES[0];
  }, [zonaFrecuente]);

  const bultoSeleccionado = useMemo(() => {
    return CATEGORIAS_BULTO.find((b) => b.id === bultoId) || CATEGORIAS_BULTO[0];
  }, [bultoId]);

  // CÁLCULO DE TARIFAS (React State en Tiempo Real)
  const calculoTarifa = useMemo(() => {
    const precioBase = zonaSeleccionada.precio;
    const kmExtras = distanciaKm > 5 ? (distanciaKm - 5) * PRECIO_KM_EXTRA : 0;
    const costoBulto = bultoSeleccionado.cargo;

    // Subtotal_1 = (Precio_Base_Zona_o_General) + (Si Km > 5 ? (Km - 5) * 400 : 0) + (Costo_Bulto)
    let subtotal1 = precioBase + kmExtras + costoBulto;

    // Si (Ida_y_Vuelta) -> Subtotal_1 += (Precio_Base_Zona_o_General + Km_Extras) * 0.5
    const recargoIdaVuelta = esIdaYVuelta ? (precioBase + kmExtras) * 0.5 : 0;
    if (esIdaYVuelta) {
      subtotal1 += recargoIdaVuelta;
    }

    // Si (Trámites) -> Subtotal_1 += Costo_Tramites
    const recargoTramites = tramiteEspera === "corto" ? 1500 : tramiteEspera === "largo" ? 3000 : 0;
    subtotal1 += recargoTramites;

    const totalFinal = subtotal1;
    const totalConLluvia = subtotal1 * 1.5;

    return {
      precioBase,
      kmExtras,
      costoBulto,
      recargoIdaVuelta,
      recargoTramites,
      totalFinal: Math.round(totalFinal),
      totalConLluvia: Math.round(totalConLluvia),
    };
  }, [zonaSeleccionada, distanciaKm, bultoSeleccionado, esIdaYVuelta, tramiteEspera]);

  // ENVIAR A WHATSAPP
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones a prueba de errores
    const hasNombreError = !nombreCompleto.trim();
    const hasOrigenError = !origen.trim();
    const hasDestinoError = !destino.trim();

    setErrors({
      nombre: hasNombreError,
      origen: hasOrigenError,
      destino: hasDestinoError,
    });

    if (hasNombreError || hasOrigenError || hasDestinoError) {
      // Hacer scroll al primer error de manera suave en móvil
      let firstErrorId = "nombre-input";
      if (!hasNombreError) {
        firstErrorId = hasOrigenError ? "origen-input" : "destino-input";
      }
      const firstError = document.getElementById(firstErrorId);
      if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Construcción del template de WhatsApp según especificación
    const bultoLabel = bultoSeleccionado.label.toUpperCase();
    const txtIdaVuelta = esIdaYVuelta ? "SÍ (+50%)" : "NO";
    const txtTramite = tramiteEspera === "corto" ? "SÍ ($1500 - HASTA 15 MIN)" : tramiteEspera === "largo" ? "SÍ ($3000 - HASTA 30 MIN)" : "NO";
    const txtLluvia = "Sujeto a clima (+50% si llueve)";
    const totalFormateado = calculoTarifa.totalFinal.toLocaleString("es-AR");

    const txtLugarPago = lugarPago === "retiro" ? "PAGA EN RETIRO (ORIGEN)" : "PAGA EN ENTREGA (DESTINO)";
    const txtMedioPago = medioPago === "efectivo" ? "EFECTIVO" : "MERCADO PAGO / TRANSFERENCIA";

    const fechaFormateada = formatFecha(fechaEnvio) || "No especificada";

    const mensaje = `🏍️ *NUEVO PEDIDO DE ENVÍO*
👤 *Cliente:* ${nombreCompleto.trim()}

📍 *HOJA DE RUTA:*
• 📅 *Fecha del envío:* ${fechaFormateada}
• 🕒 *Retirar desde:* ${horaInicio}
• 🟢 *Origen/Retiro:* ${origen.trim()}
• 🔴 *Destino/Entrega:* ${destino.trim()}

💵 *PAGO Y LOGÍSTICA:*
• 💰 *Lugar de Pago:* ${txtLugarPago}
• 💳 *Medio:* ${txtMedioPago}

📦 *DETALLE DEL PAQUETE:*
• *Tipo:* ${bultoLabel}
• *Notas/Contacto:* ${notas.trim() || "Ninguna"}

⚡ *ADICIONALES APLICADOS:*
• 🔄 *Ida y Vuelta:* ${txtIdaVuelta}
• ⏱️ *Trámite o Espera:* ${txtTramite}
• 🌧️ *Recargo por Lluvia:* ${txtLluvia}

💵 *COTIZACIÓN DE LA WEB:*
• *Total Estimado:* *$${totalFormateado}*

---
_Aviso: El precio final puede variar si hay demoras extras en el lugar o cambios en la ruta de viaje._`;

    // Redirección directa por WhatsApp
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col items-center justify-start py-8 px-4 md:py-12 md:px-8 font-sans selection:bg-emerald-500/20 selection:text-emerald-400">
      <div className="w-full max-w-lg flex flex-col gap-6">
        
        {/* CABECERA */}
        <header className="text-center md:text-left flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-emerald-400 font-medium self-center md:self-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 animate-pulse">
              <circle cx="12" cy="12" r="10" />
              <path d="m12 6-4 4 4 4" />
            </svg>
            Cotizador Instantáneo
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            MOTOENVÍOS
          </h1>
          <p className="text-sm text-zinc-400">
            Calculá el costo de tu envío en tiempo real y coordiná al instante por WhatsApp.
          </p>
        </header>

        {/* FORMULARIO PRINCIPAL */}
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800/80 rounded-[2rem] p-6 md:p-8 flex flex-col gap-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
          
          {/* DATOS DEL CLIENTE */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
              Datos del Cliente
            </h2>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nombre-input" className="text-xs text-zinc-400 font-medium">
                Nombre Completo *
              </label>
              <input
                id="nombre-input"
                type="text"
                placeholder="Tu nombre y apellido..."
                value={nombreCompleto}
                onChange={(e) => {
                  setNombreCompleto(e.target.value);
                  if (e.target.value.trim()) setErrors((prev) => ({ ...prev, nombre: false }));
                }}
                className={`w-full bg-zinc-950/60 border ${
                  errors.nombre ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-emerald-500/80"
                } rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors duration-200`}
              />
              {errors.nombre && (
                <span className="text-xs text-red-400 mt-0.5">El nombre es obligatorio.</span>
              )}
            </div>
          </div>

          {/* HOJA DE RUTA */}
          <div className="flex flex-col gap-4 border-t border-zinc-800/40 pt-4">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
              Hoja de Ruta
            </h2>

            {/* ORIGEN */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="origen-input" className="text-xs text-zinc-400 font-medium">
                Punto de Retiro (Origen) *
              </label>
              <div className="relative">
                <input
                  id="origen-input"
                  type="text"
                  placeholder="Dirección, piso, local..."
                  value={origen}
                  onChange={(e) => {
                    setOrigen(e.target.value);
                    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, origen: false }));
                  }}
                  className={`w-full bg-zinc-950/60 border ${
                    errors.origen ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-emerald-500/80"
                  } rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors duration-200`}
                />
              </div>
              {errors.origen && (
                <span className="text-xs text-red-400 mt-0.5">El punto de retiro es obligatorio.</span>
              )}
            </div>

            {/* DESTINO */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="destino-input" className="text-xs text-zinc-400 font-medium">
                Punto de Entrega (Destino) *
              </label>
              <input
                id="destino-input"
                type="text"
                placeholder="Dirección de entrega..."
                value={destino}
                onChange={(e) => {
                  setDestino(e.target.value);
                  if (e.target.value.trim()) setErrors((prev) => ({ ...prev, destino: false }));
                }}
                className={`w-full bg-zinc-950/60 border ${
                  errors.destino ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-emerald-500/80"
                } rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors duration-200`}
              />
              {errors.destino && (
                <span className="text-xs text-red-400 mt-0.5">El punto de entrega es obligatorio.</span>
              )}
            </div>

            {/* DROPDOWN ZONAS FRECUENTES */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="zona-frecuente" className="text-xs text-zinc-400 font-medium">
                Zona Frecuente (Opcional)
              </label>
              <select
                id="zona-frecuente"
                value={zonaFrecuente}
                onChange={(e) => setZonaFrecuente(e.target.value)}
                className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-emerald-500/80 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors duration-200 appearance-none cursor-pointer"
              >
                {ZONAS_FRECUENTES.map((z) => (
                  <option key={z.id} value={z.id} className="bg-zinc-900 text-zinc-100">
                    {z.label} {z.id !== "general" ? `($${z.precio.toLocaleString("es-AR")})` : `(Base: $${PRECIO_BASE_GENERAL.toLocaleString("es-AR")})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DISTANCIA */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                Distancia Estimada
              </h2>
              <span className="font-mono text-sm text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {distanciaKm} km
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              <input
                type="range"
                min="1"
                max="50"
                value={distanciaKm}
                onChange={(e) => setDistanciaKm(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 px-1">
                <span>1 km</span>
                <span className="text-emerald-500/70">5 km (Base incl.)</span>
                <span>20 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* MANUAL NUMBER INPUT (Para precisión a prueba de errores) */}
            <div className="flex items-center gap-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-3">
              <div className="text-xs text-zinc-400 flex-1 leading-snug">
                ¿Tenés el kilometraje exacto? Ajustalo manualmente:
              </div>
              <div className="flex items-center bg-[#151515] border border-zinc-800 rounded-lg overflow-hidden h-9 shadow-sm">
                <button
                  type="button"
                  onClick={() => setDistanciaKm((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors border-r border-zinc-800/80 cursor-pointer active:bg-zinc-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={distanciaKm || ""}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value));
                    setDistanciaKm(val);
                  }}
                  className="w-12 text-center bg-transparent border-0 text-sm font-bold text-zinc-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setDistanciaKm((prev) => Math.min(200, prev + 1))}
                  className="w-10 h-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors border-l border-zinc-800/80 cursor-pointer active:bg-zinc-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* PROGRAMACIÓN */}
          <div className="flex flex-col gap-4 border-t border-zinc-800/40 pt-4">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
              Programación del Envío
            </h2>
            
            <MiniCalendar selected={fechaEnvio} onSelect={setFechaEnvio} />



            {/* HORA DE INICIO */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="hora-select" className="text-xs text-zinc-400 font-medium">
                🕒 Disponible para retiro a partir de las:
              </label>
              <div className="relative">
                <select
                  id="hora-select"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full bg-[#151515] border border-zinc-800 focus:border-emerald-500/80 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition-colors duration-200 cursor-pointer appearance-none"
                >
                  <option value="Lo antes posible (Ya mismo)">Lo antes posible (Ya mismo)</option>
                  <option value="08:00 hs">08:00 hs</option>
                  <option value="09:00 hs">09:00 hs</option>
                  <option value="10:00 hs">10:00 hs</option>
                  <option value="11:00 hs">11:00 hs</option>
                  <option value="12:00 hs">12:00 hs</option>
                  <option value="13:00 hs">13:00 hs</option>
                  <option value="14:00 hs">14:00 hs</option>
                  <option value="15:00 hs">15:00 hs</option>
                  <option value="16:00 hs">16:00 hs</option>
                  <option value="17:00 hs">17:00 hs</option>
                  <option value="18:00 hs">18:00 hs</option>
                  <option value="19:00 hs">19:00 hs</option>
                  <option value="20:00 hs">20:00 hs</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* DETALLES DE BULTO */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
              Categoría de Bulto
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              {CATEGORIAS_BULTO.map((b) => {
                const isActive = bultoId === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBultoId(b.id)}
                    className={`flex items-center text-left p-4 rounded-xl border cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                      isActive
                        ? "bg-zinc-800/60 border-emerald-500/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-zinc-100"
                        : "bg-zinc-950/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-800 hover:text-zinc-300"
                    }`}
                  >
                    {/* SVG Icon Primitives instead of Emojis */}
                    <div className={`p-2.5 rounded-lg mr-4 ${isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-900 text-zinc-500"}`}>
                      {b.id === "sobre" && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      )}
                      {b.id === "chico" && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                      )}
                      {b.id === "mediano" && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                          <path d="M12 12 7.5 9.5" />
                          <path d="m12 12 4.5-2.5" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{b.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 leading-snug">{b.desc}</div>
                    </div>
                    <div className={`font-mono text-sm font-semibold ml-3 ${isActive ? "text-emerald-400" : "text-zinc-500"}`}>
                      {b.cargo === 0 ? "Gratis" : `+$${b.cargo.toLocaleString("es-AR")}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ADICIONALES DE SERVICIO */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
              Adicionales del Servicio
            </h2>
            
            <div className="flex flex-col gap-3">
              {/* IDA Y VUELTA */}
              <button
                type="button"
                onClick={() => setEsIdaYVuelta(!esIdaYVuelta)}
                className={`flex items-center justify-between p-4 rounded-xl border text-left cursor-pointer active:scale-[0.98] transition-all duration-200 ${
                  esIdaYVuelta
                    ? "bg-zinc-800/40 border-emerald-500/40 text-zinc-100"
                    : "bg-zinc-950/20 border-zinc-800/60 text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${esIdaYVuelta ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-900 text-zinc-500"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4.5 h-4.5">
                      <path d="m17 2 4 4-4 4" />
                      <path d="M3 10v-1a4 4 0 0 1 4-4h14" />
                      <path d="m7 22-4-4 4-4" />
                      <path d="M21 14v1a4 4 0 0 1-4 4H3" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-sm block">¿Es Ida y Vuelta?</span>
                    <span className="text-xs text-zinc-500">Agrega +50% sobre el recorrido (Base + Km)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs ${esIdaYVuelta ? "text-emerald-400" : "text-zinc-500"}`}>
                    +${calculoTarifa.recargoIdaVuelta.toLocaleString("es-AR")}
                  </span>
                  <div className={`w-8 h-4 rounded-full transition-colors relative ${esIdaYVuelta ? "bg-emerald-500" : "bg-zinc-800"}`}>
                    <div className={`w-3.5 h-3.5 bg-zinc-950 rounded-full absolute top-[1px] transition-transform ${esIdaYVuelta ? "translate-x-[15px]" : "translate-x-[1px]"}`} />
                  </div>
                </div>
              </button>

              {/* TRÁMITES / ESPERA (Pills de selección única) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-zinc-400 font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-zinc-500">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Trámites o Espera en Origen/Destino
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTramiteEspera("ninguno")}
                    className={`py-3 px-2 text-center rounded-xl border text-[11px] font-semibold cursor-pointer active:scale-[0.98] transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                      tramiteEspera === "ninguno"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <span>Sin Espera</span>
                    <span className="text-[9px] text-zinc-500 font-mono">$0</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTramiteEspera("corto")}
                    className={`py-3 px-2 text-center rounded-xl border text-[11px] font-semibold cursor-pointer active:scale-[0.98] transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                      tramiteEspera === "corto"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <span>Hasta 15 min</span>
                    <span className="text-[9px] text-zinc-500 font-mono">+$1.500</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTramiteEspera("largo")}
                    className={`py-3 px-2 text-center rounded-xl border text-[11px] font-semibold cursor-pointer active:scale-[0.98] transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                      tramiteEspera === "largo"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <span>Hasta 30 min</span>
                    <span className="text-[9px] text-zinc-500 font-mono">+$3.000</span>
                  </button>
                </div>
              </div>

              {/* RECARGO POR LLUVIA (Informativo) */}
              <div className="flex items-center gap-3.5 p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/20 text-zinc-400 text-xs leading-relaxed">
                <div className="p-2 rounded-lg bg-zinc-900 text-zinc-500 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4.5 h-4.5">
                    <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
                    <line x1="8" y1="16" x2="8" y2="20" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="16" y1="16" x2="16" y2="20" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-zinc-300 block">Aviso Climatológico</span>
                  En días de lluvia, se aplicará de forma obligatoria un <strong className="font-semibold text-zinc-200">recargo del +50%</strong> sobre el total final del viaje al momento de realizar el envío.
                </div>
              </div>
            </div>
          </div>

          {/* PAGO Y LOGÍSTICA */}
          <div className="flex flex-col gap-4 border-t border-zinc-800/40 pt-4">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
              Pago y Logística
            </h2>
            
            <div className="flex flex-col gap-4">
              {/* LUGAR DE PAGO */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-zinc-400 font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-zinc-500">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  ¿Dónde se realiza el pago?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    key="pago-retiro"
                    type="button"
                    onClick={() => setLugarPago("retiro")}
                    className={`py-3 px-3 text-center rounded-xl border text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all duration-200 ${
                      lugarPago === "retiro"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    Paga en Retiro (Origen)
                  </button>
                  <button
                    key="pago-entrega"
                    type="button"
                    onClick={() => setLugarPago("entrega")}
                    className={`py-3 px-3 text-center rounded-xl border text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all duration-200 ${
                      lugarPago === "entrega"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    Paga en Entrega (Destino)
                  </button>
                </div>
              </div>

              {/* MEDIO DE PAGO */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-zinc-400 font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-zinc-500">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                  Medio de pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    key="medio-efectivo"
                    type="button"
                    onClick={() => setMedioPago("efectivo")}
                    className={`py-3 px-3 text-center rounded-xl border text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all duration-200 ${
                      medioPago === "efectivo"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    Efectivo
                  </button>
                  <button
                    key="medio-transferencia"
                    type="button"
                    onClick={() => setMedioPago("transferencia")}
                    className={`py-3 px-3 text-center rounded-xl border text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all duration-200 ${
                      medioPago === "transferencia"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    Mercado Pago / Transf.
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* NOTAS ADICIONALES */}
          <div className="flex flex-col gap-1.5 border-t border-zinc-800/40 pt-4">
            <label htmlFor="notas-textarea" className="text-xs text-zinc-400 font-medium">
              Notas / Contacto de quien recibe
            </label>
            <textarea
              id="notas-textarea"
              placeholder="Ej: Entregar a Juan (Cel: 11-3456-7890), timbre 3B, portón negro..."
              rows="3"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-emerald-500/80 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors duration-200 resize-none"
            />
          </div>
        </form>

        {/* FOOTER DINÁMICO */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-[2rem] p-6 md:p-8 flex flex-col gap-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]">
          {/* DESGLOSE RESUMIDO (Estilo Cockpit/Monospace para números) */}
          <div className="flex flex-col gap-2.5 text-xs text-zinc-400 border-b border-zinc-800/80 pb-4">
            <div className="flex justify-between items-center">
              <span>Costo Base ({zonaSeleccionada.id === "general" ? "General" : "Zona"}):</span>
              <span className="font-mono text-zinc-300 font-semibold">
                ${calculoTarifa.precioBase.toLocaleString("es-AR")}
              </span>
            </div>
            {calculoTarifa.kmExtras > 0 && (
              <div className="flex justify-between items-center">
                <span>Km Extras ({distanciaKm - 5} km):</span>
                <span className="font-mono text-zinc-300 font-semibold">
                  +${calculoTarifa.kmExtras.toLocaleString("es-AR")}
                </span>
              </div>
            )}
            {calculoTarifa.costoBulto > 0 && (
              <div className="flex justify-between items-center">
                <span>Cargo por Bulto ({bultoSeleccionado.label}):</span>
                <span className="font-mono text-zinc-300 font-semibold">
                  +${calculoTarifa.costoBulto.toLocaleString("es-AR")}
                </span>
              </div>
            )}
            {esIdaYVuelta && (
              <div className="flex justify-between items-center">
                <span>Recargo Ida y Vuelta (+50%):</span>
                <span className="font-mono text-zinc-300 font-semibold">
                  +${calculoTarifa.recargoIdaVuelta.toLocaleString("es-AR")}
                </span>
              </div>
            )}
            {tramiteEspera !== "ninguno" && (
              <div className="flex justify-between items-center">
                <span>Trámites / Espera ({tramiteEspera === "corto" ? "Hasta 15 min" : "Hasta 30 min"}):</span>
                <span className="font-mono text-zinc-300 font-semibold">
                  +${calculoTarifa.recargoTramites.toLocaleString("es-AR")}
                </span>
              </div>
            )}
          </div>

          {/* TOTAL ESTIMADO */}
          <div className="flex flex-col gap-1 border-t border-zinc-800/80 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-zinc-400">TOTAL ESTIMADO:</span>
              <span className="font-mono text-3xl md:text-4xl font-extrabold text-emerald-400 tracking-tight">
                ${calculoTarifa.totalFinal.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
              <span>* Con lluvia (sujeto a clima):</span>
              <span className="font-mono">${calculoTarifa.totalConLluvia.toLocaleString("es-AR")}</span>
            </div>
          </div>

          {/* BOTÓN WHATSAPP */}
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-zinc-950 font-bold py-4 px-6 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-[0_10px_20px_-10px_rgba(16,185,129,0.3)] select-none text-base"
          >
            {/* WhatsApp Premium Icon */}
            <svg className="w-5 h-5 mr-2.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            CONFIRMAR Y ENVIAR POR WHATSAPP 📱
          </button>

          {/* AVISO LEGAL / NOTA */}
          <span className="text-[10px] text-zinc-500 text-center leading-relaxed block mt-1">
            Aviso: El precio final puede variar si hay demoras extras en el lugar o cambios en la ruta de viaje.
          </span>
        </div>
        
      </div>
    </div>
  );
}
