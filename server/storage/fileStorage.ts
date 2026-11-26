import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function saveToFile(filePath: string, data: unknown): Promise<void> {
    await mkdir(dirname(filePath), { recursive: true });

    const json = JSON.stringify(data, null, 2);

    await writeFile(filePath, json, 'utf8');
}

export async function loadFromFile<T>(filePath: string): Promise<T | null> {
    try {
        const data = await readFile(filePath, 'utf8');

        return JSON.parse(data) as T;
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}