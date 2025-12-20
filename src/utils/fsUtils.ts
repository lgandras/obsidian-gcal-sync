import { promises as fs } from 'fs';
import { exec } from 'child_process';

export function openWith(url: string): void {
    let command;
    switch (process.platform) {
        case 'darwin':
            command = 'open';
            break;
        case 'win32':
            command = 'start';
            break;
        default:
            command = 'xdg-open';
            break;
    }
    exec(`${command} "${url}"`);
}

export async function readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf-8');
}

export async function writeFile(path: string, data: string): Promise<void> {
    return fs.writeFile(path, data, 'utf-8');
}

export async function unlink(path: string): Promise<void> {
    return fs.unlink(path);
}
