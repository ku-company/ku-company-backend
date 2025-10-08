export function capitalizeFirstLetter(str: string) {
        if (!str) return str;
        const normalized = str.toLowerCase();
        const [first = "", ...rest] = Array.from(normalized);
        return first.toUpperCase() + rest.join("");
}