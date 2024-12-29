// src/components/EntityDetails/DetailsPanel.tsx
import React, { useState, useEffect, useCallback } from "react";
import type { EntityInstance, PropertyDefinition } from "../../lib/db";
import { useEntityInstances, useEntityTypes } from "../../hooks/useDatabase";

interface DetailsPanelProps {
  instance: EntityInstance;
  onInstanceUpdate?: (updatedInstance: EntityInstance) => void;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({
  instance,
  onInstanceUpdate,
}) => {
  const { updateInstance } = useEntityInstances(instance.typeId);
  const { updateType } = useEntityTypes();
  const [name, setName] = useState(instance.properties.name || "");
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState("");

  useEffect(() => {
    setName(instance.properties.name || "");
  }, [instance]);

  const handleNameSave = useCallback(
    async (newName: string) => {
      const nameToSave = newName.trim() || "Untitled";
      try {
        const updatedInstance = await updateInstance(instance.id, {
          ...instance.properties,
          name: nameToSave,
        });
        onInstanceUpdate?.(updatedInstance);
        setName(nameToSave);
      } catch (error) {
        console.error("Failed to update name:", error);
        setName(instance.properties.name || "");
      }
    },
    [instance, updateInstance, onInstanceUpdate]
  );

  const handlePropertyChange = async (propertyName: string, value: any) => {
    try {
      const updatedInstance = await updateInstance(instance.id, {
        ...instance.properties,
        [propertyName]: value,
      });
      onInstanceUpdate?.(updatedInstance);
    } catch (error) {
      console.error("Failed to update property:", error);
    }
  };

  const handleAddProperty = async () => {
    if (!newPropertyName.trim()) return;

    try {
      // Add new property to type
      const newProperty: PropertyDefinition = {
        name: newPropertyName.trim(),
        type: { kind: "text" },
        required: false,
      };

      await updateType(instance.typeId, {
        properties: [...instance.type.properties, newProperty],
      });

      // Reset form
      setNewPropertyName("");
      setIsAddingProperty(false);
    } catch (error) {
      console.error("Failed to add property:", error);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 w-full items-center">
      {/* Title */}
      <div className="w-full h-full max-w-xl space-y-8">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={(e) => handleNameSave(e.target.value)}
          placeholder="Untitled"
          className="text-lg w-full bg-transparent border-b border-green-500/30 p-2 focus:outline-none"
        />

        {/* Properties Table */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold">Properties</h2>
            <button
              onClick={() => setIsAddingProperty(true)}
              className="text-green-500 hover:text-green-400 text-sm"
            >
              Add Property
            </button>
          </div>

          <div className="border border-green-500/30 rounded">
            {instance.type.properties.map((prop) => (
              <div
                key={prop.name}
                className="flex border-b border-green-500/30 last:border-b-0"
              >
                <div className="w-1/3 p-2 border-r border-green-500/30 text-xs">
                  {prop.name}
                </div>
                <input
                  value={instance.properties[prop.name] || ""}
                  onChange={(e) =>
                    handlePropertyChange(prop.name, e.target.value)
                  }
                  className="w-2/3 p-2 bg-transparent text-xs focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Add Property Form */}
          {isAddingProperty && (
            <div className="flex space-x-2">
              <input
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
                placeholder="Property name"
                className="flex-1 bg-transparent border border-green-500/30 p-1 text-xs rounded focus:outline-none"
              />
              <button
                onClick={handleAddProperty}
                className="text-green-500 hover:text-green-400 text-xs"
              >
                Add
              </button>
              <button
                onClick={() => setIsAddingProperty(false)}
                className="text-red-500 hover:text-red-400 text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-sm font-semibold mb-2">Notes</h2>
          <textarea
            value={instance.properties.notes || ""}
            onChange={(e) => handlePropertyChange("notes", e.target.value)}
            className="flex-1 bg-transparent border border-green-500/30 p-2 text-xs rounded focus:outline-none resize-none"
            placeholder="Start typing..."
          />
        </div>
      </div>
    </div>
  );
};

export default DetailsPanel;
