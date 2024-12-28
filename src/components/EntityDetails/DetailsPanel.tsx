// src/components/EntityDetails/DetailsPanel.tsx
import React from "react";
import type { EntityInstance, PropertyType } from "../../lib/db";
import { useEntityType } from "../../hooks/useDatabase";

interface DetailsPanelProps {
  instance: EntityInstance;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ instance }) => {
  const { type, loading, error } = useEntityType(instance.typeId);

  if (loading) return <div className="p-2">Loading details...</div>;
  if (error)
    return <div className="p-2 text-red-500">Error: {error.message}</div>;
  if (!type) return <div className="p-2">Type not found</div>;

  return (
    <div className="space-y-4">
      <div className="border-b border-green-500/30 pb-2">
        <div className="text-green-300">Type: {type.name}</div>
        <div className="text-xl">
          {instance.properties.name || "Unnamed Instance"}
        </div>
      </div>

      <div className="space-y-2">
        {type.properties.map((prop) => (
          <div key={prop.name} className="flex">
            <div className="w-1/3 text-green-300">{prop.name}:</div>
            <div>
              {formatPropertyValue(instance.properties[prop.name], prop.type)}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-green-500/50">
        <div>
          Created: {new Date(instance.metadata.created).toLocaleString()}
        </div>
        <div>
          Modified: {new Date(instance.metadata.modified).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

function formatPropertyValue(value: any, type: PropertyType): string {
  if (value === undefined || value === null) return "-";

  switch (type.kind) {
    case "date":
      return new Date(value).toLocaleDateString();
    case "boolean":
      return value ? "Yes" : "No";
    case "reference":
      return `→ ${value}`;
    case "enum":
      return value;
    default:
      return String(value);
  }
}

export default DetailsPanel;
