// src/lib/db/index.ts
import { Database } from "./database";
import { EntityTypeStore } from "./entity-type-store";
import { EntityInstanceStore } from "./entity-instance-store";
import type {
  EntityType,
  EntityInstance,
  PropertyDefinition,
  PropertyType,
} from "./types";

export class EntityDB {
  private database: Database;
  public types: EntityTypeStore;
  public instances: EntityInstanceStore;

  constructor() {
    this.database = new Database();
    this.types = new EntityTypeStore(this.database);
    this.instances = new EntityInstanceStore(this.database);
  }

  async initialize(): Promise<void> {
    await this.database.init();
  }

  async validatePropertyType(propertyType: PropertyType): Promise<boolean> {
    switch (propertyType.kind) {
      case "text":
      case "number":
      case "date":
      case "boolean":
        return true;
      case "reference":
        return (
          typeof propertyType.typeId === "string" &&
          Boolean(await this.types.getType(propertyType.typeId))
        );
      case "enum":
        return (
          Array.isArray(propertyType.values) &&
          propertyType.values.every((value) => typeof value === "string")
        );
      default:
        return false;
    }
  }

  async validateProperty(property: PropertyDefinition): Promise<boolean> {
    if (!property.name || !property.type) {
      return false;
    }

    return await this.validatePropertyType(property.type);
  }

  async createTypeAndInstance(
    typeData: Omit<EntityType, "id">,
    instanceProperties: Record<string, any>
  ): Promise<{
    type: EntityType;
    instance: EntityInstance;
  }> {
    const type = await this.types.createType(typeData);
    const instance = await this.instances.createInstance(
      type.id,
      instanceProperties
    );
    return { type, instance };
  }

  async getStorageUsage(): Promise<{
    typeCount: number;
    instanceCount: number;
  }> {
    const types = await this.types.getAllTypes();
    let instanceCount = 0;

    for (const type of types) {
      const instances = await this.instances.getInstancesByType(type.id);
      instanceCount += instances.length;
    }

    return {
      typeCount: types.length,
      instanceCount,
    };
  }
}

// Export all types
export type {
  EntityType,
  EntityInstance,
  PropertyDefinition,
  PropertyType,
} from "./types";

// Create and export a default instance
const db = new EntityDB();
export default db;
