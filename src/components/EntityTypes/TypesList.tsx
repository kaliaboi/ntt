// src/components/EntityTypes/TypesList.tsx
import React from "react";
import { useEntityTypes } from "../../hooks/useDatabase";

interface TypesListProps {
  onSelectType: (typeId: string) => void;
  selectedTypeId?: string;
}

const TypesList: React.FC<TypesListProps> = ({
  onSelectType,
  selectedTypeId,
}) => {
  const { types, loading, error, deleteType } = useEntityTypes();

  const handleDelete = async (e: React.MouseEvent, typeId: string) => {
    e.stopPropagation(); // Prevent type selection when clicking delete
    try {
      const deleted = await deleteType(typeId);
      if (deleted && selectedTypeId === typeId) {
        onSelectType(""); // Clear selection if deleted type was selected
      }
    } catch (error) {
      console.error("Failed to delete type:", error);
      alert("Failed to delete type");
    }
  };

  if (loading) return <div className="p-2">Loading types...</div>;
  if (error)
    return <div className="p-2 text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-1">
      {types.map((type) => (
        <div
          key={type.id}
          className={`text-xs p-2 cursor-pointer hover:bg-green-500/10 ${
            selectedTypeId === type.id ? "bg-green-500/20" : ""
          } flex justify-between items-center`}
          onClick={() => onSelectType(type.id)}
        >
          <span>{type.name}</span>
          <button
            onClick={(e) => handleDelete(e, type.id)}
            className="text-red-500 hover:text-red-400 px-2"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default TypesList;
