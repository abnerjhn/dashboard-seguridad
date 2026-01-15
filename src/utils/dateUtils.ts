export const getWeekDateRange = (week: number, year: number): string => {
    // Simple approximation: Week 1 2025 starts Mon Dec 30 2024.
    const simpleStart = new Date(year, 0, 1);
    // Correct to monday
    const day = simpleStart.getDay();
    const diff = simpleStart.getDate() - day + (day === 0 ? -6 : 1);
    const week1Start = new Date(simpleStart.setDate(diff));

    const currentWeekStart = new Date(week1Start.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    const currentWeekEnd = new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };

    // Capitalize month names (es-CL usually lowercase)
    const startStr = currentWeekStart.toLocaleDateString('es-CL', options);
    const endStr = currentWeekEnd.toLocaleDateString('es-CL', { ...options, year: 'numeric' });

    // Helper to capitalize first letter
    const capitalize = (s: string) => s.replace(/(^\w|\s\w)/g, m => m.toUpperCase());

    return `${capitalize(startStr)} - ${capitalize(endStr)}`;
};
