import { logger } from "./logger";

// Utility para verificar se está dentro do horário
export const checkSchedule = (horario: any): string => {
    try {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentDayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
        const dayOfWeekMap = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
        const currentDayName = dayOfWeekMap[currentDayOfWeek];
        
        // Verificar se o horário é aplicável hoje com base no tipo
        let isApplicableToday = false;
        
        if (horario.type === 'day' || horario.type === 'specific') {
            // Para tipo 'day' ou 'specific', verifica se a data é hoje
            const horarioDate = horario.date instanceof Date ? 
                horario.date.toISOString().split('T')[0] : 
                new Date(horario.date).toISOString().split('T')[0];
            isApplicableToday = horarioDate === today;
        } else if (horario.type === 'weekdays') {
            // Para tipo 'weekdays', verifica se o dia atual está na lista de dias da semana
            isApplicableToday = Array.isArray(horario.weekdays) && horario.weekdays.includes(currentDayName);
        } else if (horario.type === 'annual') {
            // Para tipo 'annual', verifica se o mês e dia batem, independente do ano
            const horarioDate = horario.date instanceof Date ? horario.date : new Date(horario.date);
            isApplicableToday = horarioDate.getMonth() === now.getMonth() && horarioDate.getDate() === now.getDate();
        }
        
        // Se não for aplicável hoje, retorna "fora"
        if (!isApplicableToday) {
            return "fora";
        }
        
        // Obter horas e minutos atuais
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Formatar como HH:MM para comparação
        const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Verificar se o horário atual está dentro do intervalo definido
        const isInTimeRange = currentTimeString >= horario.startTime && currentTimeString <= horario.endTime;
        
        // Determinar o status com base no workedDay e no intervalo de tempo
        if (horario.workedDay && isInTimeRange) {
            // Em dia trabalhado, estando dentro do horário = dentro
            return "dentro";
        } else if (!horario.workedDay && !isInTimeRange) {
            // Em dia de folga, estando fora do horário = dentro (lógica invertida)
            return "dentro";
        } else {
            // Outros casos = fora
            return "fora";
        }
    } catch (error) {
        logger.error(`Erro ao verificar horário: ${error.message}`);
        return "fora"; // Em caso de erro, considera-se fora do horário
    }
};