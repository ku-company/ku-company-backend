export interface S3KeyStrategy {
    generateKey(fileName: string, context?: Record<string, any>): string;
}

function sanitizeFileName(name: string): string {
    // Drop any path components and normalize
    const base = name.split('/').pop()?.split('\\').pop() || 'file';
    // Allow only safe characters
    const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_');
    // Enforce reasonable length
    return cleaned.slice(0, 128) || 'file';
}

export class ImageKeyStrategy implements S3KeyStrategy {
    generateKey(fileName: string, context?: Record<string, any>): string {
        const role = context?.role;
        const prefix = `user-${role}`
        const safe = sanitizeFileName(fileName);
        return `${prefix}/${Date.now()}-${safe}`;
    }
}

export class DocumentKeyStrategy implements S3KeyStrategy {
    generateKey(fileName: string, context?: Record<string, any>): string {
        const role = context?.role;
        const employeeId = context?.employeeId; // id of Alumni or Student
        const prefix = `user-${role}`
        const safe = sanitizeFileName(fileName);
        return `${prefix}/${employeeId}/resume_${Date.now()}-${safe}`;
    }
}
