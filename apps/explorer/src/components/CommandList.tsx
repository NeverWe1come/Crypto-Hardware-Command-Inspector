/**
 * @packageDocumentation
 * Interactive command list component with drag-and-drop reordering (`@chci/explorer`).
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getDeviceSpec } from '@chci/device-specs';
import type { CommandDirection } from '@chci/parser-core';
import { useOptionalWorkspace } from '../state/workspace-context';
import type { CommandEntry, WorkspaceTab } from '../state/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Plus,
  Copy,
  Trash2,
  GripVertical,
  Link2,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

export interface CommandListProps {
  readonly tab?: WorkspaceTab;
  readonly activeCommandId?: string | null;
  readonly onSelectCommand?: (commandId: string) => void;
  readonly onAddCommand?: () => void;
  readonly onDeleteCommand?: (commandId: string) => void;
  readonly onDuplicateCommand?: (commandId: string) => void;
  readonly onReorderCommands?: (commandIds: readonly string[]) => void;
  readonly onUpdateDirection?: (commandId: string, direction: CommandDirection) => void;
  readonly onUpdateVersion?: (commandId: string, version: string) => void;
  readonly onLinkCommands?: (commandId: string, targetCommandId: string | null) => void;
  readonly onUpdateHeaderLength?: (headerLength: number) => void;
}

function arrayMove<T>(array: readonly T[], from: number, to: number): T[] {
  const newArray = [...array];
  const [removed] = newArray.splice(from, 1);
  if (removed !== undefined) {
    newArray.splice(to, 0, removed);
  }
  return newArray;
}

interface SortableCommandItemProps {
  readonly cmd: CommandEntry;
  readonly index: number;
  readonly tab: WorkspaceTab;
  readonly isActive: boolean;
  readonly versions: readonly string[];
  readonly onSelect: (id: string) => void;
  readonly onDuplicate: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly onUpdateDirection: (id: string, dir: CommandDirection) => void;
  readonly onUpdateVersion: (id: string, ver: string) => void;
  readonly onLink: (id: string, targetId: string | null) => void;
}

const SortableCommandItem = React.memo(function SortableCommandItem({
  cmd,
  index,
  tab,
  isActive,
  versions,
  onSelect,
  onDuplicate,
  onDelete,
  onUpdateDirection,
  onUpdateVersion,
  onLink
}: SortableCommandItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cmd.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.6 : 1
  };

  const isRequest = cmd.direction === 'request';
  const targetIndex = cmd.linkedCommandId
    ? tab.commands.findIndex((c) => c.id === cmd.linkedCommandId)
    : -1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="button"
      tabIndex={0}
      aria-selected={isActive}
      aria-label={`Comando #${index + 1}`}
      data-testid={`command-item-${cmd.id}`}
      data-active={isActive ? 'true' : 'false'}
      onClick={() => onSelect(cmd.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(cmd.id);
        }
      }}
      className={`group flex items-center justify-between p-2 rounded-md border text-xs transition-all cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
        isActive
          ? 'bg-primary/10 border-primary/60 shadow-xs'
          : 'bg-card border-border/50 hover:border-border hover:bg-muted/30'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Drag handle */}
        <button
          type="button"
          data-testid={`command-drag-handle-${cmd.id}`}
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Reordenar comando #${index + 1}`}
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground shrink-0 rounded-xs hover:bg-muted"
        >
          <GripVertical className="size-3.5" />
        </button>

        {/* Ordinal indicator */}
        <span
          data-testid={`command-ordinal-${cmd.id}`}
          className="font-mono text-xs font-bold text-foreground/80 shrink-0 min-w-[24px]"
        >
          #{index + 1}
        </span>

        {/* Direction toggle button */}
        <button
          type="button"
          data-testid={`command-direction-${cmd.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onUpdateDirection(cmd.id, isRequest ? 'response' : 'request');
          }}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-sm font-medium text-[11px] shrink-0 transition-colors ${
            isRequest
              ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/30'
              : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
          }`}
          aria-label={isRequest ? 'Dirección: Petición' : 'Dirección: Respuesta'}
        >
          {isRequest ? (
            <>
              <ArrowUpRight className="size-3" />
              <span>Petición</span>
            </>
          ) : (
            <>
              <ArrowDownLeft className="size-3" />
              <span>Respuesta</span>
            </>
          )}
        </button>

        {/* Firmware Version Selector */}
        <select
          data-testid={`command-version-${cmd.id}`}
          value={cmd.version}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdateVersion(cmd.id, e.target.value)}
          aria-label={`Versión de firmware del comando #${index + 1}`}
          className="h-6 px-1.5 text-[11px] font-mono bg-muted/50 border border-border rounded-sm text-foreground shrink-0"
        >
          {versions.map((ver) => (
            <option key={ver} value={ver}>
              v{ver}
            </option>
          ))}
        </select>

        {/* Linked status badge */}
        {targetIndex !== -1 && (
          <Badge
            variant="outline"
            size="xs"
            data-testid={`command-link-badge-${cmd.id}`}
            className="gap-1 font-mono text-[10px] bg-primary/5 text-primary border-primary/20 shrink-0"
          >
            <Link2 className="size-2.5" />
            #{targetIndex + 1}
          </Badge>
        )}

        {/* Linked Target Selector */}
        <select
          data-testid={`command-link-select-${cmd.id}`}
          value={cmd.linkedCommandId ?? 'none'}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onLink(cmd.id, e.target.value === 'none' ? null : e.target.value)}
          aria-label={`Vincular comando #${index + 1}`}
          className="h-6 px-1.5 text-[11px] bg-muted/40 border border-border/60 rounded-sm text-muted-foreground hover:text-foreground shrink-0 max-w-[130px] truncate"
        >
          <option value="none">Desvincular</option>
          {tab.commands
            .filter((c) => c.id !== cmd.id)
            .map((c) => {
              const cIdx = tab.commands.indexOf(c);
              const dirLabel = c.direction === 'request' ? 'Petición' : 'Respuesta';
              return (
                <option key={c.id} value={c.id}>
                  #{cIdx + 1} ({dirLabel})
                </option>
              );
            })}
        </select>
      </div>

      {/* Duplicate & Delete actions */}
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid={`command-duplicate-${cmd.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(cmd.id);
          }}
          aria-label={`Duplicar comando #${index + 1}`}
          className="size-7 p-0 text-muted-foreground hover:text-foreground rounded-xs"
        >
          <Copy className="size-3" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid={`command-delete-${cmd.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(cmd.id);
          }}
          aria-label={`Eliminar comando #${index + 1}`}
          className="size-7 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-xs"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
});

/**
 * CommandList component displays the session's commands for the active hardware tab,
 * supporting selection, version/direction toggles, request/response linking, and dnd-kit sortable reordering.
 */
export function CommandList(props: CommandListProps) {
  const workspace = useOptionalWorkspace();

  const activeTabFromContext = workspace?.state.tabs.find(
    (t) => t.id === workspace.state.activeTabId
  );
  const currentTab = props.tab ?? activeTabFromContext;

  const activeCommandId =
    props.activeCommandId !== undefined
      ? props.activeCommandId
      : (currentTab?.activeCommandId ?? null);

  const spec = currentTab ? getDeviceSpec(currentTab.deviceId) : undefined;
  const availableVersions = spec
    ? Object.keys(spec.versions)
    : currentTab
      ? [currentTab.version]
      : [];

  const defaultHeaderLen =
    spec?.framing.type === 'header-positional' ? spec.framing.defaultHeaderLength : 0;
  const currentHeaderLen = currentTab?.headerLength ?? defaultHeaderLen;

  const [prevHeaderLen, setPrevHeaderLen] = React.useState(currentHeaderLen);
  const [headerLenStr, setHeaderLenStr] = React.useState<string>(String(currentHeaderLen));

  if (prevHeaderLen !== currentHeaderLen) {
    setPrevHeaderLen(currentHeaderLen);
    setHeaderLenStr(String(currentHeaderLen));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleSelectCommand = (id: string) => {
    if (props.onSelectCommand) {
      props.onSelectCommand(id);
    } else if (workspace?.dispatch) {
      workspace.dispatch({ type: 'SELECT_COMMAND', payload: { commandId: id } });
    }
  };

  const handleAddCommand = () => {
    if (props.onAddCommand) {
      props.onAddCommand();
    } else if (workspace?.dispatch) {
      workspace.dispatch({ type: 'ADD_COMMAND' });
    }
  };

  const handleDeleteCommand = (id: string) => {
    if (props.onDeleteCommand) {
      props.onDeleteCommand(id);
    } else if (workspace?.dispatch) {
      workspace.dispatch({ type: 'DELETE_COMMAND', payload: { commandId: id } });
    }
  };

  const handleDuplicateCommand = (id: string) => {
    if (props.onDuplicateCommand) {
      props.onDuplicateCommand(id);
    } else if (workspace?.dispatch) {
      workspace.dispatch({ type: 'DUPLICATE_COMMAND', payload: { commandId: id } });
    }
  };

  const handleUpdateDirection = (id: string, direction: CommandDirection) => {
    if (props.onUpdateDirection) {
      props.onUpdateDirection(id, direction);
    } else if (workspace?.dispatch) {
      workspace.dispatch({
        type: 'UPDATE_COMMAND_DIRECTION',
        payload: { commandId: id, direction }
      });
    }
  };

  const handleUpdateVersion = (id: string, version: string) => {
    if (props.onUpdateVersion) {
      props.onUpdateVersion(id, version);
    } else if (workspace?.dispatch) {
      workspace.dispatch({
        type: 'UPDATE_COMMAND_VERSION',
        payload: { commandId: id, version }
      });
    }
  };

  const handleLinkCommands = (id: string, targetId: string | null) => {
    if (props.onLinkCommands) {
      props.onLinkCommands(id, targetId);
    } else if (workspace?.dispatch) {
      workspace.dispatch({
        type: 'LINK_COMMANDS',
        payload: { commandId: id, targetCommandId: targetId }
      });
    }
  };

  const handleReorder = (ids: readonly string[]) => {
    if (props.onReorderCommands) {
      props.onReorderCommands(ids);
    } else if (workspace?.dispatch) {
      workspace.dispatch({
        type: 'REORDER_COMMANDS',
        payload: { commandIds: ids }
      });
    }
  };

  const handleUpdateHeaderLength = (len: number) => {
    if (len < 0 || len > 128) return;
    if (props.onUpdateHeaderLength) {
      props.onUpdateHeaderLength(len);
    } else if (workspace?.dispatch) {
      workspace.dispatch({
        type: 'UPDATE_TAB_HEADER_LENGTH',
        payload: { headerLength: len }
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!currentTab) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = currentTab.commands.findIndex((c) => c.id === active.id);
      const newIndex = currentTab.commands.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newCommands = arrayMove(currentTab.commands, oldIndex, newIndex);
        handleReorder(newCommands.map((c) => c.id));
      }
    }
  };

  if (!currentTab || currentTab.commands.length === 0) {
    return (
      <div data-testid="command-list" className="p-4 flex flex-col gap-3">
        <div
          data-testid="no-commands-message"
          className="text-center text-xs text-muted-foreground p-6 border border-dashed rounded-md bg-muted/10"
        >
          <FormattedMessage
            id="editor.noCommands"
            defaultMessage="No hay comandos en la pestaña activa"
          />
        </div>
        <Button
          type="button"
          data-testid="add-command-button"
          onClick={handleAddCommand}
          className="h-8 text-xs gap-1.5 self-start"
        >
          <Plus className="size-3.5" />
          <FormattedMessage id="editor.addCommand" defaultMessage="Nuevo comando" />
        </Button>
      </div>
    );
  }

  return (
    <div data-testid="command-list" className="flex flex-col h-full overflow-hidden select-none">
      {/* Header-positional device header length configuration */}
      {spec?.framing.type === 'header-positional' && (
        <div className="flex items-center justify-between p-2.5 px-3 bg-muted/30 border-b border-border text-xs shrink-0">
          <label htmlFor="tab-header-length" className="text-muted-foreground font-medium">
            <FormattedMessage
              id="editor.headerLength"
              defaultMessage="Longitud de Cabecera"
            />
            :
          </label>
          <input
            id="tab-header-length"
            type="number"
            min={0}
            max={128}
            data-testid="tab-header-length-input"
            value={headerLenStr}
            onChange={(e) => {
              const text = e.target.value;
              setHeaderLenStr(text);
              const val = parseInt(text, 10);
              if (!isNaN(val) && val >= 0 && val <= 128) {
                handleUpdateHeaderLength(val);
              }
            }}
            className="w-16 h-7 px-2 text-center text-xs font-mono bg-background border border-border rounded-md text-foreground focus:outline-hidden focus:border-primary"
          />
        </div>
      )}

      {/* Sortable Command List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div data-testid="command-sortable-container">
            <SortableContext
              items={currentTab.commands.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {currentTab.commands.map((cmd, index) => (
                  <SortableCommandItem
                    key={cmd.id}
                    cmd={cmd}
                    index={index}
                    tab={currentTab}
                    isActive={cmd.id === activeCommandId}
                    versions={availableVersions}
                    onSelect={handleSelectCommand}
                    onDuplicate={handleDuplicateCommand}
                    onDelete={handleDeleteCommand}
                    onUpdateDirection={handleUpdateDirection}
                    onUpdateVersion={handleUpdateVersion}
                    onLink={handleLinkCommands}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </DndContext>
      </div>

      {/* Footer toolbar: Add command button */}
      <div className="p-3 border-t border-border bg-card/60 flex items-center justify-between shrink-0">
        <Button
          type="button"
          data-testid="add-command-button"
          onClick={handleAddCommand}
          size="sm"
          className="h-8 text-xs gap-1.5"
        >
          <Plus className="size-3.5" />
          <FormattedMessage id="editor.addCommand" defaultMessage="Nuevo comando" />
        </Button>

        <span className="text-[11px] text-muted-foreground font-mono">
          {currentTab.commands.length}{' '}
          {currentTab.commands.length === 1 ? 'comando' : 'comandos'}
        </span>
      </div>
    </div>
  );
}
