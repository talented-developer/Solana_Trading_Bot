import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerService {
  private timestamps: Map<string, number> = new Map();

  canExecute(key: string): boolean {
    const interval = 5000;
    const now = Date.now();
    const lastExecution = this.timestamps.get(key) || 0;
    const diff = now - lastExecution;
    if (diff >= interval) {
      this.timestamps.set(key, now);
      return true;
    }

    return false;
  }
}