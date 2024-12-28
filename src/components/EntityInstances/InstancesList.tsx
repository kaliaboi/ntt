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
  const { instances, loading, error, createInstance } =
    useEntityInstances(typeId);

  const handleCreateInstance = async () => {
    const newInstance = await createInstance({
      name: "Untitled",
      content: "",
    });
    onSelectInstance(newInstance);
  };

  if (loading) return <div className="p-2">Loading instances...</div>;
  if (error)
    return <div className="p-2 text-red-500">Error: {error.message}</div>;

  return (
    <div>
      <div className="p-2 border-b border-green-500/30 flex justify-between items-center">
        <span>Instances</span>
        <button
          onClick={handleCreateInstance}
          className="text-green-500 hover:text-green-400"
        >
          +
        </button>
      </div>
      <div className="space-y-1">
        {instances.map((instance) => (
          <div
            key={instance.id}
            className={`p-2 cursor-pointer hover:bg-green-500/10 ${
              selectedInstanceId === instance.id ? "bg-green-500/20" : ""
            }`}
            onClick={() => onSelectInstance(instance)}
          >
            {instance.properties.name || "Untitled"}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstancesList;
