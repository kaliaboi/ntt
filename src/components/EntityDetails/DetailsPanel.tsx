// src/components/EntityDetails/DetailsPanel.tsx
import React, { useState, useEffect } from "react";
import type { EntityInstance } from "../../lib/db";
import { useEntityType, useEntityInstances } from "../../hooks/useDatabase";

interface DetailsPanelProps {
  instance: EntityInstance;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ instance }) => {
  const { type } = useEntityType(instance.typeId);
  const { updateInstance } = useEntityInstances(instance.typeId);
  const [name, setName] = useState(instance.properties.name || "Untitled");
  const [content, setContent] = useState(instance.properties.content || "");

  // Update local state when instance changes
  useEffect(() => {
    setName(instance.properties.name || "Untitled");
    setContent(instance.properties.content || "");
  }, [instance]);

  const handleNameChange = async (newName: string) => {
    setName(newName);
    await updateInstance(instance.id, {
      ...instance.properties,
      name: newName,
    });
  };

  const handleContentChange = async (newContent: string) => {
    setContent(newContent);
    await updateInstance(instance.id, {
      ...instance.properties,
      content: newContent,
    });
  };

  if (!type) return null;

  return (
    <div className="h-full flex flex-col">
      <input
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        className="w-full bg-transparent border-b border-green-500/30 p-2 focus:outline-none"
      />
      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        className="flex-1 w-full bg-transparent p-2 focus:outline-none resize-none"
        placeholder="Start typing..."
      />
    </div>
  );
};

export default DetailsPanel;
