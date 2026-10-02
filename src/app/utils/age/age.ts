/**
 * Calculates exact age in years from a birthdate string (YYYY-MM-DD) or Date object,
 * avoiding timezone offset drift.
 */
export function calculateAge(birthdate: string | Date | null | undefined): number | null {
    if (!birthdate) {
        return null;
    }

    let birthYear: number;
    let birthMonth: number;
    let birthDay: number;

    if (typeof birthdate === 'string') {
        const parts = birthdate.split('-');
        if (parts.length !== 3) {
            return null;
        }
        birthYear = parseInt(parts[0], 10);
        birthMonth = parseInt(parts[1], 10) - 1;
        birthDay = parseInt(parts[2], 10);
    } else {
        birthYear = birthdate.getFullYear();
        birthMonth = birthdate.getMonth();
        birthDay = birthdate.getDate();
    }

    if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) {
        return null;
    }

    const today = new Date();
    let age = today.getFullYear() - birthYear;
    const monthDiff = today.getMonth() - birthMonth;

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
        age--;
    }

    return age >= 0 ? age : null;
}
