import { google } from 'googleapis';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

// Janelas de horário padrão por turno (America/Fortaleza)
const SHIFT_HOURS: Record<string, { start: string; end: string }> = {
  M: { start: '08:00:00', end: '12:00:00' },
  T: { start: '13:00:00', end: '17:00:00' },
  N: { start: '18:00:00', end: '21:00:00' },
};

export interface VisitCalendarEvent {
  schoolName: string;
  responsibleName: string;
  contactEmail: string;
  contactPhone: string;
  studentsCount: number;
  targetDate: string | Date; // coluna `date` do Postgres — o driver pode retornar Date
  shift: 'M' | 'T' | 'N';
  labs: string[];
}

// Normaliza para YYYY-MM-DD independente do driver ter retornado string ou Date
function toDateOnly(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
}

// America/Fortaleza não observa horário de verão (fixo em UTC-03:00),
// então dá pra montar o timestamp com offset explícito sem consultar timezone.
const UTC_OFFSET = '-03:00';

function buildTimeRange(dateOnly: string, shift: 'M' | 'T' | 'N') {
  const hours = SHIFT_HOURS[shift] || SHIFT_HOURS.M;
  return {
    start: `${dateOnly}T${hours.start}${UTC_OFFSET}`,
    end: `${dateOnly}T${hours.end}${UTC_OFFSET}`,
  };
}

class CalendarService {
  private readonly enabled: boolean;
  private readonly calendar;

  constructor() {
    const { clientId, clientSecret, refreshToken } = config.googleCalendar;
    this.enabled = Boolean(clientId && clientSecret && refreshToken);

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    if (!this.enabled) {
      logger.warn(
        'Google Calendar não configurado (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REFRESH_TOKEN ausentes) — eventos de visita não serão sincronizados.'
      );
    }
  }

  /**
   * Verifica se já existe algum compromisso na agenda do DEPPI que se
   * sobreponha à janela do turno pretendido. Retorna false (não bloqueia)
   * se o Calendar não estiver configurado ou se a consulta falhar — a
   * ausência de sincronização não deve travar a confirmação da visita.
   */
  public async isTimeSlotBusy(
    targetDate: string | Date,
    shift: 'M' | 'T' | 'N'
  ): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const dateOnly = toDateOnly(targetDate);
      const { start, end } = buildTimeRange(dateOnly, shift);
      const calendarId = config.googleCalendar.calendarId;

      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: start,
          timeMax: end,
          items: [{ id: calendarId }],
        },
      });

      const busy = response.data.calendars?.[calendarId]?.busy ?? [];
      return busy.length > 0;
    } catch (error) {
      logger.error(
        'Erro ao consultar disponibilidade no Google Calendar:',
        error
      );
      return false;
    }
  }

  public async createVisitEvent(visit: VisitCalendarEvent): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      const hours = SHIFT_HOURS[visit.shift] || SHIFT_HOURS.M;
      const timezone = config.googleCalendar.timezone;
      const dateOnly = toDateOnly(visit.targetDate);

      await this.calendar.events.insert({
        calendarId: config.googleCalendar.calendarId,
        requestBody: {
          summary: `Visita Técnica — ${visit.schoolName}`,
          description: [
            `Responsável: ${visit.responsibleName}`,
            `Contato: ${visit.contactEmail} / ${visit.contactPhone}`,
            `Alunos: ${visit.studentsCount}`,
            visit.labs.length > 0
              ? `Laboratórios: ${visit.labs.join(', ')}`
              : undefined,
          ]
            .filter(Boolean)
            .join('\n'),
          start: {
            dateTime: `${dateOnly}T${hours.start}`,
            timeZone: timezone,
          },
          end: {
            dateTime: `${dateOnly}T${hours.end}`,
            timeZone: timezone,
          },
        },
      });

      logger.info(
        `Evento de visita criado na agenda do DEPPI para ${visit.schoolName} em ${dateOnly}`
      );
    } catch (error) {
      // Falha ao sincronizar com a agenda não deve impedir a confirmação da visita
      logger.error('Erro ao criar evento na agenda do Google Calendar:', error);
    }
  }
}

export const calendarService = new CalendarService();
