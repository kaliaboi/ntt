// src/components/EntityInstances/InstancesList.tsx
import React from "react";
import { useEntityInstances } from "../../hooks/useDatabase";
import type { EntityInstance } from "../../lib/db";

interface InstancesListProps {
  typeId: string;
  onSelectInstance: (instance: EntityInstance) => void;
  selectedInstanceId?: string;
}

const InstancesList: React.FC<InstancesListProps> = ({
  typeId,
  onSelectInstance,
  selectedInstanceId,
}) => {
  const { instances, loading, error } = useEntityInstances(typeId);

  if (loading) return <div className="p-2">Loading instances...</div>;
  if (error)
    return <div className="p-2 text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-1">
      {instances.map((instance) => (
        <div
          key={instance.id}
          className={`p-2 cursor-pointer hover:bg-green-500/10 ${
            selectedInstanceId === instance.id ? "bg-green-500/20" : ""
          }`}
          onClick={() => onSelectInstance(instance)}
        >
          {instance.properties.name || `Instance ${instance.id.slice(0, 8)}`}
        </div>
      ))}
    </div>
  );
};

export default InstancesList;
