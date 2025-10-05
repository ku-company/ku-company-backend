export interface S3KeyStrategy {
    generateKey(fileName: string, context?: Record<string, any>): string;
}

export class ImageKeyStrategy implements S3KeyStrategy {
    generateKey(fileName: string, context?: Record<string, any>): string {
        const role = context?.role;
        const prefix = `user-${role}`
        return `${prefix}/${Date.now()}-${fileName}`;
    }
}

export class DocumentKeyStrategy implements S3KeyStrategy {
    generateKey(fileName: string, context?: Record<string, any>): string {
        const role = context?.role;
        const employeeId = context?.employeeId; // id of Alumni or Student
        const prefix = `user-${role}`
        return `${prefix}/${employeeId}/resume_${Date.now()}-${fileName}`;
    }
}
