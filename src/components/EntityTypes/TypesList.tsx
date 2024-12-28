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
  const { types, loading, error } = useEntityTypes();

  if (loading) return <div className="p-2">Loading types...</div>;
  if (error)
    return <div className="p-2 text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-1">
      {types.map((type) => (
        <div
          key={type.id}
          className={`p-2 cursor-pointer hover:bg-green-500/10 ${
            selectedTypeId === type.id ? "bg-green-500/20" : ""
          }`}
          onClick={() => onSelectType(type.id)}
        >
          {type.name}
        </div>
      ))}
    </div>
  );
};

export default TypesList;
