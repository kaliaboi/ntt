import React, { useState } from "react";
import { useEntityTypes } from "../../hooks/useDatabase";
import type { PropertyDefinition } from "../../lib/db";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateTypeDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateTypeDialog: React.FC<CreateTypeDialogProps> = ({
  open,
  onClose,
}) => {
  const { createType, refreshTypes } = useEntityTypes();
  const [name, setName] = useState("");
  const [properties, setProperties] = useState<PropertyDefinition[]>([
    { name: "name", type: { kind: "text" }, required: true },
    { name: "content", type: { kind: "text" }, required: false },
  ]);

  const handleSubmit = async () => {
    try {
      if (!name.trim()) {
        alert("Type name is required");
        return;
      }

      await createType({
        name,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        properties,
      });
      await refreshTypes();
      setName("");
      setProperties([
        { name: "name", type: { kind: "text" }, required: true },
        { name: "content", type: { kind: "text" }, required: false },
      ]);
      onClose();
    } catch (error) {
      console.error("Failed to create type:", error);
      alert(
        "Failed to create type: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-green-500/30 text-green-500 font-mono">
        <DialogHeader>
          <DialogTitle>Create New Type</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm">Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-green-500/30 p-2 mt-1 text-green-500 focus:outline-none focus:border-green-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm">Properties:</label>
            {properties.map((prop, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={prop.name}
                  onChange={(e) => {
                    const newProps = [...properties];
                    newProps[index] = { ...prop, name: e.target.value };
                    setProperties(newProps);
                  }}
                  className="flex-1 bg-black border border-green-500/30 p-2 text-green-500 focus:outline-none focus:border-green-500"
                  placeholder="Property name"
                  disabled={prop.name === "name" || prop.name === "content"}
                />
                <select
                  value={prop.type.kind}
                  onChange={(e) => {
                    const newProps = [...properties];
                    newProps[index] = {
                      ...prop,
                      type: { kind: e.target.value as any },
                    };
                    setProperties(newProps);
                  }}
                  className="bg-black border border-green-500/30 p-2 text-green-500 focus:outline-none focus:border-green-500"
                  disabled={prop.name === "name" || prop.name === "content"}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="boolean">Boolean</option>
                </select>
                {prop.name !== "name" && prop.name !== "content" && (
                  <button
                    onClick={() => {
                      const newProps = properties.filter((_, i) => i !== index);
                      setProperties(newProps);
                    }}
                    className="text-green-500 hover:text-green-400 px-2"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() =>
                setProperties([
                  ...properties,
                  { name: "", type: { kind: "text" }, required: false },
                ])
              }
              className="mt-2 text-green-500 hover:text-green-400"
            >
              + Add Property
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={handleSubmit}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-500 px-4 py-2"
            >
              Create
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTypeDialog;
