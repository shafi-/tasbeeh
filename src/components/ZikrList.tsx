import { useState } from 'react';
import { useZikrStore } from '../core/stores/zikrStore';
import { Zikr } from '../core/db/types';
import { AddZikrModal } from './AddZikrModal';
import { EditZikrModal } from './EditZikrModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface ZikrListProps {
  onZikrSelect?: (zikr: Zikr) => void;
  selectedZikr?: Zikr | null;
  showActions?: boolean;
}

export function ZikrList({ onZikrSelect, selectedZikr, showActions = true }: ZikrListProps) {
  const zikrs = useZikrStore(state => state.zikrs);
  const loading = useZikrStore(state => state.loading);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<Zikr | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<Zikr | null>(null);

  // Separate predefined and custom zikrs
  const predefinedZikrs = zikrs.filter(z => !z.custom && !z.deletedAt);
  const customZikrs = zikrs.filter(z => z.custom && !z.deletedAt);

  const handleEdit = (zikr: Zikr) => {
    setSelectedForEdit(zikr);
    setEditModalOpen(true);
  };

  const handleDelete = (zikr: Zikr) => {
    setSelectedForDelete(zikr);
    setDeleteModalOpen(true);
  };

  const handleZikrClick = (zikr: Zikr) => {
    if (onZikrSelect) {
      onZikrSelect(zikr);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (zikrs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No zikrs yet - create your first one!</p>
        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg min-h-[44px]"
        >
          Add Zikr
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {/* Predefined Zikrs */}
        {predefinedZikrs.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Common Zikrs</h3>
            <div className="space-y-1">
              {predefinedZikrs.map(zikr => (
                <ZikrListItem
                  key={zikr.id}
                  zikr={zikr}
                  isSelected={selectedZikr?.id === zikr.id}
                  onClick={() => handleZikrClick(zikr)}
                  showActions={showActions}
                  onEdit={() => handleEdit(zikr)}
                  onDelete={() => handleDelete(zikr)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Custom Zikrs */}
        {customZikrs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">My Zikrs</h3>
            <div className="space-y-1">
              {customZikrs.map(zikr => (
                <ZikrListItem
                  key={zikr.id}
                  zikr={zikr}
                  isSelected={selectedZikr?.id === zikr.id}
                  onClick={() => handleZikrClick(zikr)}
                  showActions={showActions}
                  onEdit={() => handleEdit(zikr)}
                  onDelete={() => handleDelete(zikr)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Add Button */}
        {showActions && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg min-h-[44px] flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span> Add Zikr
          </button>
        )}
      </div>

      {/* Modals */}
      <AddZikrModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      {selectedForEdit && (
        <EditZikrModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedForEdit(null);
          }}
          zikr={selectedForEdit}
        />
      )}

      {selectedForDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedForDelete(null);
          }}
          zikr={selectedForDelete}
        />
      )}
    </>
  );
}

interface ZikrListItemProps {
  zikr: Zikr;
  isSelected?: boolean;
  onClick: () => void;
  showActions: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function ZikrListItem({ zikr, isSelected, onClick, showActions, onEdit, onDelete }: ZikrListItemProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.touches[0].clientX;
    const diff = touchEnd - touchStart;

    if (Math.abs(diff) > 50) {
      setSwipeDirection(diff > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);

    if (swipeDirection === 'left' && zikr.custom) {
      onEdit();
    } else if (swipeDirection === 'right' && zikr.custom) {
      onDelete();
    }

    setSwipeDirection(null);
  };

  return (
    <div
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all min-h-[44px] flex items-center justify-between
        ${isSelected
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg font-medium">{zikr.name}</span>
        {zikr.custom && (
          <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
            Custom
          </span>
        )}
      </div>

      {showActions && zikr.custom && (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Edit zikr"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Delete zikr"
          >
            🗑️
          </button>
        </div>
      )}

      {/* Swipe hints */}
      <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 pointer-events-none">
        <span className="text-2xl">✏️ Edit</span>
        <span className="text-2xl">Delete 🗑️</span>
      </div>
    </div>
  );
}