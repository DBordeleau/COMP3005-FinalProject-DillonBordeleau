// Helper function that formats a time string (HH:MM:SS or HH:MM) to 12-hour format with AM/PM
export function formatTime(timeString: string): string {
    // Parse time string (HH:MM:SS or HH:MM)
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const minute = minutes || '00';

    // Convert to 12-hour format
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return `${hour12}:${minute} ${period}`;
}