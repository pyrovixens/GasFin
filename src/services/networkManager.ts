// ==========================================
// GastFin - Live Network & Online/Offline Auto-Sync Manager
// ==========================================

export type NetworkStatusListener = (isOnline: boolean) => void;

class NetworkManager {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<NetworkStatusListener> = new Set();
  private pendingSyncCallbacks: Set<() => Promise<void> | void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notifyListeners(true);
    this.flushPendingSync();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notifyListeners(false);
  };

  public getIsOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : this.isOnline;
  }

  public subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.getIsOnline());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach((listener) => {
      try {
        listener(isOnline);
      } catch (err) {
        console.warn('Network listener error:', err);
      }
    });
  }

  public registerSyncOnReconnect(callback: () => Promise<void> | void) {
    this.pendingSyncCallbacks.add(callback);
  }

  public unregisterSyncOnReconnect(callback: () => Promise<void> | void) {
    this.pendingSyncCallbacks.delete(callback);
  }

  public async flushPendingSync() {
    if (!this.getIsOnline()) return;
    for (const callback of this.pendingSyncCallbacks) {
      try {
        await callback();
      } catch (err) {
        console.warn('Auto-sync execution error:', err);
      }
    }
  }
}

export const networkManager = new NetworkManager();
