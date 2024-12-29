// src/lib/db/database.ts

import { EntityTypeStore } from "./entity-type-store";
import { EntityInstanceStore } from "./entity-instance-store";

const DB_NAME = "EntityDB";
const DB_VERSION = 1;

export class Database {
  private db: IDBDatabase | null = null;
  public types: EntityTypeStore;
  public instances: EntityInstanceStore;

  constructor() {
    this.types = new EntityTypeStore(this);
    this.instances = new EntityInstanceStore(this);
  }

  // Initialize the database
  async init(): Promise<void> {
    if (this.db) return; // If already initialized, do nothing

    try {
      this.db = await this.openDB();
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }

  // Open the IndexedDB database
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      // Handle errors
      request.onerror = () => reject(request.error);

      // Handle successful opening
      request.onsuccess = () => resolve(request.result);

      // This runs when:
      // 1. Database is created for the first time
      // 2. Database version is increased
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create store for Entity Types
        if (!db.objectStoreNames.contains("entityTypes")) {
          const typeStore = db.createObjectStore("entityTypes", {
            keyPath: "id",
          });
          typeStore.createIndex("by-name", "name", { unique: true });
        }

        // Create store for Entity Instances
        if (!db.objectStoreNames.contains("entityInstances")) {
          const instanceStore = db.createObjectStore("entityInstances", {
            keyPath: "id",
          });
          instanceStore.createIndex("by-type", "typeId", { unique: false });
        }

        // Create store for References
        if (!db.objectStoreNames.contains("references")) {
          const refStore = db.createObjectStore("references", {
            keyPath: ["fromId", "toId"],
          });
          refStore.createIndex("by-from", "fromId", { unique: false });
          refStore.createIndex("by-to", "toId", { unique: false });
        }
      };
    });
  }

  // Helper method to run database transactions
  async runTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => Promise<T>
  ): Promise<T> {
    if (!this.db) throw new Error("Database not initialized");

    const tx = this.db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    try {
      // Run the callback and await its result
      const result = await callback(store);

      // Wait for transaction to complete
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });

      return result;
    } catch (error) {
      tx.abort();
      throw error;
    }
  }
}
