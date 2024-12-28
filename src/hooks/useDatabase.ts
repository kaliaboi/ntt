// src/hooks/useDatabase.ts
import { useState, useEffect } from "react";
import db, { EntityType, EntityInstance } from "../lib/db";

// Hook for managing database initialization
export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    db.initialize()
      .then(() => setIsInitialized(true))
      .catch(setError);
  }, []);

  return { isInitialized, error };
}

// Hook for managing entity types
export function useEntityTypes() {
  const [types, setTypes] = useState<EntityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const allTypes = await db.types.getAllTypes();
      setTypes(allTypes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load types"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const createType = async (type: Omit<EntityType, "id">) => {
    try {
      const newType = await db.types.createType(type);
      setTypes((prev) => [...prev, newType]);
      return newType;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to create type");
    }
  };

  return { types, loading, error, createType, refreshTypes: loadTypes };
}

// Hook for managing instances of a specific type
export function useEntityInstances(typeId: string) {
  const [instances, setInstances] = useState<EntityInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const typeInstances = await db.instances.getInstancesByType(typeId);
      setInstances(typeInstances);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load instances")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstances();
  }, [typeId]);

  const createInstance = async (properties: Record<string, any>) => {
    try {
      const newInstance = await db.instances.createInstance(typeId, properties);
      setInstances((prev) => [...prev, newInstance]);
      return newInstance;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to create instance");
    }
  };

  const updateInstance = async (
    id: string,
    properties: Record<string, any>
  ) => {
    try {
      const updated = await db.instances.updateProperties(id, properties);
      setInstances((prev) =>
        prev.map((instance) => (instance.id === id ? updated : instance))
      );
      return updated;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update instance");
    }
  };

  const deleteInstance = async (id: string) => {
    try {
      await db.instances.deleteInstance(id);
      setInstances((prev) => prev.filter((instance) => instance.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to delete instance");
    }
  };

  return {
    instances,
    loading,
    error,
    createInstance,
    updateInstance,
    deleteInstance,
    refreshInstances: loadInstances,
  };
}

// Hook for a single instance
export function useEntityInstance(id: string) {
  const [instance, setInstance] = useState<EntityInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadInstance = async () => {
    try {
      setLoading(true);
      const loadedInstance = await db.instances.getInstance(id);
      setInstance(loadedInstance);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load instance")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstance();
  }, [id]);

  const updateInstance = async (properties: Record<string, any>) => {
    try {
      const updated = await db.instances.updateProperties(id, properties);
      setInstance(updated);
      return updated;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update instance");
    }
  };

  return {
    instance,
    loading,
    error,
    updateInstance,
    refreshInstance: loadInstance,
  };
}

// src/hooks/useDatabase.ts
// ... (previous hooks remain the same)

// Hook for searching across all instances
export function useSearch() {
  const [results, setResults] = useState<EntityInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const searchResults = await db.instances.searchInstances(query);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Search failed"));
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
}

// Hook for filtered instances based on property values
export function useFilteredInstances(
  typeId: string,
  filters: Record<string, any>
) {
  const [instances, setInstances] = useState<EntityInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadFiltered = async () => {
      try {
        setLoading(true);
        const allInstances = await db.instances.getInstancesByType(typeId);

        const filtered = allInstances.filter((instance) => {
          return Object.entries(filters).every(([key, value]) => {
            if (value === undefined || value === null) return true;
            return instance.properties[key] === value;
          });
        });

        setInstances(filtered);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to load filtered instances")
        );
      } finally {
        setLoading(false);
      }
    };

    loadFiltered();
  }, [typeId, JSON.stringify(filters)]);

  return { instances, loading, error };
}

// Hook for property-based grouping
export function useGroupedInstances(typeId: string, groupByProperty: string) {
  const [groups, setGroups] = useState<Record<string, EntityInstance[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadGrouped = async () => {
      try {
        setLoading(true);
        const instances = await db.instances.getInstancesByType(typeId);

        const grouped = instances.reduce((acc, instance) => {
          const key = String(
            instance.properties[groupByProperty] || "undefined"
          );
          acc[key] = acc[key] || [];
          acc[key].push(instance);
          return acc;
        }, {} as Record<string, EntityInstance[]>);

        setGroups(grouped);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to load grouped instances")
        );
      } finally {
        setLoading(false);
      }
    };

    loadGrouped();
  }, [typeId, groupByProperty]);

  return { groups, loading, error };
}

// Hook for related instances (following references)
export function useRelatedInstances(instanceId: string) {
  const [relatedInstances, setRelatedInstances] = useState<
    Record<string, EntityInstance[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadRelated = async () => {
      try {
        setLoading(true);
        const instance = await db.instances.getInstance(instanceId);
        if (!instance) throw new Error("Instance not found");

        const type = await db.types.getType(instance.typeId);
        if (!type) throw new Error("Type not found");

        const related: Record<string, EntityInstance[]> = {};

        // Find reference properties
        const referenceProps = type.properties.filter(
          (prop) => prop.type.kind === "reference"
        );

        // Load related instances for each reference property
        for (const prop of referenceProps) {
          const refValue = instance.properties[prop.name];
          if (refValue) {
            if (Array.isArray(refValue)) {
              // Handle multiple references
              const instances = await Promise.all(
                refValue.map((id) => db.instances.getInstance(id))
              );
              related[prop.name] = instances.filter(
                (i): i is EntityInstance => i !== null
              );
            } else {
              // Handle single reference
              const relatedInstance = await db.instances.getInstance(refValue);
              if (relatedInstance) {
                related[prop.name] = [relatedInstance];
              }
            }
          }
        }

        setRelatedInstances(related);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to load related instances")
        );
      } finally {
        setLoading(false);
      }
    };

    loadRelated();
  }, [instanceId]);

  return { relatedInstances, loading, error };
}

// Hook for property statistics
export function usePropertyStats(typeId: string, propertyName: string) {
  const [stats, setStats] = useState<{
    count: number;
    unique: number;
    histogram?: Record<string, number>;
  }>({ count: 0, unique: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const instances = await db.instances.getInstancesByType(typeId);

        const values = instances.map((i) => i.properties[propertyName]);
        const uniqueValues = new Set(values);

        const histogram = values.reduce((acc, val) => {
          const key = String(val);
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setStats({
          count: values.length,
          unique: uniqueValues.size,
          histogram,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to load property statistics")
        );
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [typeId, propertyName]);

  return { stats, loading, error };
}
