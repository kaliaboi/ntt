// src/components/Layout/MainLayout.tsx
import React, { useState } from "react";
import { useDatabase, useEntityTypes } from "../../hooks/useDatabase";
import TypesList from "../EntityTypes/TypesList";
import InstancesList from "../EntityInstances/InstancesList";
import DetailsPanel from "../EntityDetails/DetailsPanel";
import CreateTypeDialog from "../EntityTypes/CreateTypeDialog";
import type { EntityInstance } from "../../lib/db";

const MainLayout: React.FC = () => {
  const { isInitialized } = useDatabase();
  const [selectedTypeId, setSelectedTypeId] = useState<string>();
  const [selectedInstance, setSelectedInstance] = useState<EntityInstance>();
  const [createTypeDialogOpen, setCreateTypeDialogOpen] = useState(false);

  if (!isInitialized) {
    return (
      <div className="h-screen bg-black text-green-500 p-4 font-mono">
        Initializing database...
      </div>
    );
  }

  const handleInstanceUpdate = (updatedInstance: EntityInstance) => {
    setSelectedInstance(updatedInstance);
  };

  return (
    <div className="h-screen bg-black text-green-500 font-mono">
      <div className="h-full flex">
        <div className="w-48 border-r border-green-500/30">
          <div className="p-2 border-b border-green-500/30 flex justify-between items-center">
            <span>Types</span>
            <button
              onClick={() => setCreateTypeDialogOpen(true)}
              className="text-green-500 hover:text-green-400"
            >
              +
            </button>
          </div>
          <TypesList
            selectedTypeId={selectedTypeId}
            onSelectType={(typeId) => {
              setSelectedTypeId(typeId);
              setSelectedInstance(undefined);
            }}
          />
        </div>

        {selectedTypeId && (
          <div className="w-48 border-r border-green-500/30">
            <InstancesList
              typeId={selectedTypeId}
              selectedInstanceId={selectedInstance?.id}
              onSelectInstance={setSelectedInstance}
              onInstanceUpdate={handleInstanceUpdate}
            />
          </div>
        )}

        {selectedInstance && (
          <div className="flex-1">
            <DetailsPanel
              instance={selectedInstance}
              onInstanceUpdate={handleInstanceUpdate}
            />
          </div>
        )}
      </div>

      <CreateTypeDialog
        open={createTypeDialogOpen}
        onClose={() => setCreateTypeDialogOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
