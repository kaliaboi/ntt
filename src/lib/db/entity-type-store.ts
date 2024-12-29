// src/lib/db/entity-type-store.ts
import { Database } from "./database";
import { EntityInstance, EntityType, PropertyDefinition } from "./types";

export class EntityTypeStore {
  constructor(private db: Database) {}

  async createType(type: Omit<EntityType, "id">): Promise<EntityType> {
    const newType: EntityType = {
      ...type,
      id: crypto.randomUUID(),
    };

    await this.db.runTransaction("entityTypes", "readwrite", async (store) => {
      // Check for existing type with same name
      const index = store.index("by-name");
      const existingType = await new Promise<EntityType | undefined>(
        (resolve, reject) => {
          const request = index.get(IDBKeyRange.only(type.name));
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        }
      );

      if (existingType) {
        throw new Error(`Type with name "${type.name}" already exists`);
      }

      // Add the new type
      await new Promise<void>((resolve, reject) => {
        const request = store.add(newType);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    return newType;
  }

  async getType(id: string): Promise<EntityType | null> {
    return await this.db.runTransaction(
      "entityTypes",
      "readonly",
      async (store) => {
        return new Promise<EntityType | null>((resolve, reject) => {
          const request = store.get(IDBKeyRange.only(id));
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error);
        });
      }
    );
  }

  async getTypeByName(name: string): Promise<EntityType | null> {
    return await this.db.runTransaction(
      "entityTypes",
      "readonly",
      async (store) => {
        return new Promise<EntityType | null>((resolve, reject) => {
          const index = store.index("by-name");
          const request = index.get(IDBKeyRange.only(name));
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error);
        });
      }
    );
  }

  async getAllTypes(): Promise<EntityType[]> {
    return await this.db.runTransaction(
      "entityTypes",
      "readonly",
      async (store) => {
        return new Promise<EntityType[]>((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
    );
  }

  async updateType(
    id: string,
    updates: Partial<EntityType>
  ): Promise<EntityType> {
    return await this.db.runTransaction(
      "entityTypes",
      "readwrite",
      async (store) => {
        // Get existing type
        const existingType = await new Promise<EntityType | undefined>(
          (resolve, reject) => {
            const request = store.get(IDBKeyRange.only(id));
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          }
        );

        if (!existingType) {
          throw new Error(`Type ${id} not found`);
        }

        // If name is being updated, check for conflicts
        if (updates.name && updates.name !== existingType.name) {
          const index = store.index("by-name");
          const nameConflict = await new Promise<EntityType | undefined>(
            (resolve, reject) => {
              const request = index.get(IDBKeyRange.only(updates.name));
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
            }
          );

          if (nameConflict) {
            throw new Error(`Type with name "${updates.name}" already exists`);
          }
        }

        // Merge updates with existing type
        const updatedType = { ...existingType, ...updates };

        // Save updated type
        await new Promise<void>((resolve, reject) => {
          const request = store.put(updatedType);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        return updatedType;
      }
    );
  }

  async addProperty(
    typeId: string,
    property: PropertyDefinition
  ): Promise<EntityType> {
    return await this.db.runTransaction(
      "entityTypes",
      "readwrite",
      async (store) => {
        // Get existing type
        const existingType = await new Promise<EntityType | undefined>(
          (resolve, reject) => {
            const request = store.get(IDBKeyRange.only(typeId));
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          }
        );

        if (!existingType) {
          throw new Error(`Type ${typeId} not found`);
        }

        // Check if property name already exists
        if (existingType.properties.some((p) => p.name === property.name)) {
          throw new Error(
            `Property "${property.name}" already exists on this type`
          );
        }

        // Add new property
        const updatedType = {
          ...existingType,
          properties: [...existingType.properties, property],
        };

        // Save updated type
        await new Promise<void>((resolve, reject) => {
          const request = store.put(updatedType);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        return updatedType;
      }
    );
  }

  async removeProperty(
    typeId: string,
    propertyName: string
  ): Promise<EntityType> {
    return await this.db.runTransaction(
      "entityTypes",
      "readwrite",
      async (store) => {
        // Get existing type
        const existingType = await new Promise<EntityType | undefined>(
          (resolve, reject) => {
            const request = store.get(IDBKeyRange.only(typeId));
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          }
        );

        if (!existingType) {
          throw new Error(`Type ${typeId} not found`);
        }

        // Remove property
        const updatedType = {
          ...existingType,
          properties: existingType.properties.filter(
            (p) => p.name !== propertyName
          ),
        };

        // Save updated type
        await new Promise<void>((resolve, reject) => {
          const request = store.put(updatedType);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        return updatedType;
      }
    );
  }

  async deleteType(id: string): Promise<void> {
    await this.db.runTransaction("entityTypes", "readwrite", async (store) => {
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getTypeInstanceCount(id: string): Promise<number> {
    const instances = await this.db.runTransaction(
      "entityInstances",
      "readonly",
      async (store) => {
        const index = store.index("by-type");
        return new Promise<EntityInstance[]>((resolve, reject) => {
          const request = index.getAll(IDBKeyRange.only(id));
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
    );
    return instances.length;
  }
}
