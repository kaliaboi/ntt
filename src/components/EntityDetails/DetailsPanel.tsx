// src/components/EntityDetails/DetailsPanel.tsx
import React, { useState, useEffect, useCallback } from "react";
import type { EntityInstance } from "../../lib/db";
import { useEntityInstances } from "../../hooks/useDatabase";

interface DetailsPanelProps {
  instance: EntityInstance;
  onInstanceUpdate?: (updatedInstance: EntityInstance) => void;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({
  instance,
  onInstanceUpdate,
}) => {
  const { updateInstance } = useEntityInstances(instance.typeId);
  const [name, setName] = useState(instance.properties.name || "");
  const [content, setContent] = useState(instance.properties.content || "");

  // Update local state when instance changes
  useEffect(() => {
    setName(instance.properties.name || "");
    setContent(instance.properties.content || "");
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

  const handleContentSave = useCallback(
    async (newContent: string) => {
      try {
        const updatedInstance = await updateInstance(instance.id, {
          ...instance.properties,
          content: newContent,
        });
        onInstanceUpdate?.(updatedInstance);
      } catch (error) {
        console.error("Failed to update content:", error);
        setContent(instance.properties.content || "");
      }
    },
    [instance, updateInstance, onInstanceUpdate]
  );

  return (
    <div className="h-full flex flex-col">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={(e) => handleNameSave(e.target.value)}
        placeholder="Untitled"
        className="text-xs w-full bg-transparent border-b border-green-500/30 p-2 focus:outline-none"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={(e) => handleContentSave(e.target.value)}
        className="text-xs flex-1 w-full bg-transparent p-2 focus:outline-none resize-none"
        placeholder="Start typing..."
      />
    </div>
  );
};

export default DetailsPanel;
