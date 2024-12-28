// src/lib/db/entity-instance-store.ts
import { Database } from "./database";
import { EntityInstance } from "./types";

export class EntityInstanceStore {
  constructor(private db: Database) {}

  async createInstance(
    typeId: string,
    properties: Record<string, any>
  ): Promise<EntityInstance> {
    const instance: EntityInstance = {
      id: crypto.randomUUID(),
      typeId,
      properties,
      metadata: {
        created: Date.now(),
        modified: Date.now(),
      },
    };

    await this.db.runTransaction(
      "entityInstances",
      "readwrite",
      async (store) => {
        await new Promise<void>((resolve, reject) => {
          const request = store.add(instance);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    );

    return instance;
  }

  async getInstance(id: string): Promise<EntityInstance | null> {
    return await this.db.runTransaction(
      "entityInstances",
      "readonly",
      async (store) => {
        return new Promise<EntityInstance | null>((resolve, reject) => {
          const request = store.get(IDBKeyRange.only(id));
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error);
        });
      }
    );
  }

  async getInstancesByType(typeId: string): Promise<EntityInstance[]> {
    return await this.db.runTransaction(
      "entityInstances",
      "readonly",
      async (store) => {
        const index = store.index("by-type");
        return new Promise<EntityInstance[]>((resolve, reject) => {
          const request = index.getAll(IDBKeyRange.only(typeId));
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
    );
  }

  async updateInstance(
    id: string,
    updates: Partial<EntityInstance>
  ): Promise<EntityInstance> {
    return await this.db.runTransaction(
      "entityInstances",
      "readwrite",
      async (store) => {
        // Get existing instance
        const existingInstance = await new Promise<EntityInstance | undefined>(
          (resolve, reject) => {
            const request = store.get(IDBKeyRange.only(id));
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          }
        );

        if (!existingInstance) {
          throw new Error(`Instance ${id} not found`);
        }

        // Merge updates with existing instance
        const updatedInstance = {
          ...existingInstance,
          ...updates,
          metadata: {
            ...existingInstance.metadata,
            modified: Date.now(),
          },
        };

        // Save updated instance
        await new Promise<void>((resolve, reject) => {
          const request = store.put(updatedInstance);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        return updatedInstance;
      }
    );
  }

  async updateProperties(
    id: string,
    properties: Record<string, any>
  ): Promise<EntityInstance> {
    return await this.db.runTransaction(
      "entityInstances",
      "readwrite",
      async (store) => {
        const existingInstance = await new Promise<EntityInstance | undefined>(
          (resolve, reject) => {
            const request = store.get(IDBKeyRange.only(id));
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          }
        );

        if (!existingInstance) {
          throw new Error(`Instance ${id} not found`);
        }

        const updatedInstance = {
          ...existingInstance,
          properties: {
            ...existingInstance.properties,
            ...properties,
          },
          metadata: {
            ...existingInstance.metadata,
            modified: Date.now(),
          },
        };

        await new Promise<void>((resolve, reject) => {
          const request = store.put(updatedInstance);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        return updatedInstance;
      }
    );
  }

  async deleteInstance(id: string): Promise<void> {
    await this.db.runTransaction(
      "entityInstances",
      "readwrite",
      async (store) => {
        const existingInstance = await new Promise<EntityInstance | undefined>(
          (resolve, reject) => {
            const request = store.get(IDBKeyRange.only(id));
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          }
        );

        if (!existingInstance) {
          throw new Error(`Instance ${id} not found`);
        }

        await new Promise<void>((resolve, reject) => {
          const request = store.delete(id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    );
  }

  async searchInstances(query: string): Promise<EntityInstance[]> {
    return await this.db.runTransaction(
      "entityInstances",
      "readonly",
      async (store) => {
        const allInstances: EntityInstance[] = await new Promise(
          (resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          }
        );

        // Simple search through properties
        return allInstances.filter((instance) => {
          const values = Object.values(instance.properties);
          return values.some((value) =>
            String(value).toLowerCase().includes(query.toLowerCase())
          );
        });
      }
    );
  }

  async getInstancesByPropertyValue(
    typeId: string,
    propertyName: string,
    value: any
  ): Promise<EntityInstance[]> {
    const instances = await this.getInstancesByType(typeId);
    return instances.filter(
      (instance) => instance.properties[propertyName] === value
    );
  }
}
