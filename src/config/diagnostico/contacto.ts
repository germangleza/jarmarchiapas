// Contacto para agendar la lectura del diagnóstico. Todo en un solo lugar.

/** ⚠️ Número pendiente de confirmar. Formato internacional sin "+" ni espacios. */
export const whatsappLectura = "529611855475";

/** Mensaje de WhatsApp. {optica} y {puntaje} se reemplazan. */
export const whatsappLecturaMensaje =
  "Hola, hice el Diagnóstico 360 de mi óptica ({optica}) y obtuve {puntaje}/100. Me gustaría agendar mi lectura.";

/** Link corto del calendario de citas de Google: se abre en pestaña nueva
 *  como respaldo (y siempre, mientras calendarioEmbed esté vacío). */
export const calendarioLink = "https://calendar.app.google/EBawGUvoQWYu4He78";

/** URL larga para el iframe: en Google Calendar → calendario de citas →
 *  Compartir → "Insertar en sitio web", copiar el src del iframe. Tiene la
 *  forma https://calendar.google.com/calendar/appointments/schedules/<ID>?gv=true
 *  Mientras esté vacía, el botón abre el calendario en una pestaña nueva. */
export const calendarioEmbed = "";
