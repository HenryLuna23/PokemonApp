import { calculateAge } from './age';

describe('calculateAge', () => {
    it('should return null for empty or invalid dates', () => {
        expect(calculateAge(null)).toBeNull();
        expect(calculateAge('')).toBeNull();
        expect(calculateAge('invalid-date')).toBeNull();
    });

    it('should calculate age correctly for an adult born 20 years ago', () => {
        const today = new Date();
        const twentyYearsAgo = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
        const formatted = twentyYearsAgo.toISOString().split('T')[0];

        expect(calculateAge(formatted)).toBe(20);
    });

    it('should calculate age correctly for a minor born 10 years ago', () => {
        const today = new Date();
        const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
        const formatted = tenYearsAgo.toISOString().split('T')[0];

        expect(calculateAge(formatted)).toBe(10);
    });
});
