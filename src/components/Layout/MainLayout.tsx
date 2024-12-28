// src/components/Layout/MainLayout.tsx
import React, { useState } from "react";
import { useDatabase } from "../../hooks/useDatabase";
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

  return (
    <div className="h-screen bg-black text-green-500 font-mono">
      <div className="flex h-full">
        {/* Types Panel */}
        <div className="w-1/4 border-r border-green-500/30">
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
            onSelectType={(id) => {
              setSelectedTypeId(id);
              setSelectedInstance(undefined);
            }}
            selectedTypeId={selectedTypeId}
          />
        </div>

        {/* Instances Panel */}
        <div className="w-1/4 border-r border-green-500/30">
          {selectedTypeId ? (
            <InstancesList
              typeId={selectedTypeId}
              onSelectInstance={setSelectedInstance}
              selectedInstanceId={selectedInstance?.id}
            />
          ) : (
            <div className="p-2">Select a type to view instances</div>
          )}
        </div>

        {/* Details Panel */}
        <div className="flex-1">
          {selectedInstance ? (
            <DetailsPanel instance={selectedInstance} />
          ) : (
            <div className="p-2">Select an instance to view details</div>
          )}
        </div>
      </div>

      <CreateTypeDialog
        open={createTypeDialogOpen}
        onClose={() => setCreateTypeDialogOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
