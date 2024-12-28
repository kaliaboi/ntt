// This defines what an Entity Type looks like
export interface EntityType {
  id: string; // Unique identifier for each type
  name: string; // Name of the type (e.g., "Person", "Book")
  color: string; // Color identifier for visual distinction
  properties: PropertyDefinition[]; // List of properties this type has
}

// This defines how properties are structured for each type
export interface PropertyDefinition {
  name: string; // Name of the property (e.g., "name", "age")
  type: PropertyType; // What kind of property is it
  required: boolean; // Is this property required?
  reference?: {
    // If this property references another entity type
    typeId: string; // Which type does it reference
    multiple: boolean; // Can it reference multiple instances?
  };
}

// These are the different kinds of properties we support
export type PropertyType =
  | { kind: "text" } // For text values
  | { kind: "number" } // For numeric values
  | { kind: "date" } // For dates
  | { kind: "boolean" } // For true/false values
  | { kind: "reference"; typeId: string } // For referencing other entities
  | { kind: "enum"; values: string[] }; // For selecting from a list of values

// This defines what an instance of an entity looks like
export interface EntityInstance {
  id: string; // Unique identifier for the instance
  typeId: string; // Which type this instance belongs to
  properties: {
    // The actual values for each property
    [key: string]: any; // Key is property name, value is the property value
  };
  metadata: {
    created: number; // When was this instance created
    modified: number; // When was it last modified
  };
}

// This defines how references between instances are stored
export interface Reference {
  fromId: string; // ID of the instance making the reference
  toId: string; // ID of the instance being referenced
  propertyName: string; // Name of the property making the reference
  typeId: string; // Type of the reference
}
