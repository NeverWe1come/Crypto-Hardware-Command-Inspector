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
import type { CommandDirection, DeviceInterfaceSpec } from '@chci/parser-core';
import { useOptionalWorkspace } from '../state/workspace-context';
import type { CommandEntry, WorkspaceTab } from '../state/types';
import { Button } from './ui/button';
import {
  Plus,
  Copy,
  Trash2,
  GripVertical,
  ArrowUpRight,
  ArrowDownLeft,
  Radio
} from 'lucide-react';

/**
 * Props accepted by the {@link CommandList} component.
 */
export interface CommandListProps {
  /** Active workspace tab (defaults to active tab from context). */
  readonly tab?: WorkspaceTab;
  /** Currently active command ID. */
  readonly activeCommandId?: string | null;
  /** Callback fired when a command item is clicked/selected. */
  readonly onSelectCommand?: (commandId: string) => void;
  /** Callback fired when the add new command button is clicked. */
  readonly onAddCommand?: () => void;
  /** Callback fired when a command delete button is clicked. */
  readonly onDeleteCommand?: (commandId: string) => void;
  /** Callback fired when a command duplicate button is clicked. */
  readonly onDuplicateCommand?: (commandId: string) => void;
  /** Callback fired when commands are reordered via drag-and-drop. */
  readonly onReorderCommands?: (commandIds: readonly string[]) => void;
  /** Callback fired when a command's direction (request/response) is changed. */
  readonly onUpdateDirection?: (commandId: string, direction: CommandDirection) => void;
  /** Callback fired when a command's firmware version is modified. */
  readonly onUpdateVersion?: (commandId: string, version: string) => void;
  /** Callback fired when a command's active interface is modified. */
  readonly onUpdateInterface?: (commandId: string, interfaceId: string) => void;
  /** Callback fired when updating header length for header-positional devices. */
  readonly onUpdateHeaderLength?: (headerLength: number) => void;
  /** Callback fired when updating individual command header length. */
  readonly onUpdateCommandHeaderLength?: (commandId: string, headerLength: number) => void;
  /** Callback fired when toggling live hardware execution for a request command. */
  readonly onToggleLiveExecution?: (commandId: string, enabled: boolean) => void;
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
  readonly isActive: boolean;
  readonly versions: readonly string[];
  readonly interfaces?: readonly DeviceInterfaceSpec[];
  readonly defaultInterface?: string;
  readonly isHeaderPositional: boolean;
  readonly defaultHeaderLen: number;
  readonly onSelect: (id: string) => void;
  readonly onDuplicate: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly onUpdateDirection: (id: string, dir: CommandDirection) => void;
  readonly onUpdateVersion: (id: string, ver: string) => void;
  readonly onUpdateInterface: (id: string, ifaceId: string) => void;
  readonly onUpdateCommandHeaderLength: (id: string, len: number) => void;
  readonly onToggleLiveExecution: (id: string, enabled: boolean) => void;
}

const SortableCommandItem = React.memo(function SortableCommandItem({
  cmd,
  index,
  isActive,
  versions,
  interfaces,
  defaultInterface,
  isHeaderPositional,
  defaultHeaderLen,
  onSelect,
  onDuplicate,
  onDelete,
  onUpdateDirection,
  onUpdateVersion,
  onUpdateInterface,
  onUpdateCommandHeaderLength,
  onToggleLiveExecution
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
      className={`group flex items-center justify-between p-2.5 rounded-md border text-xs transition-all cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#ff7800] ${
        isActive
          ? 'bg-[#283350] border-[#ff7800] border-l-4 border-l-[#ff7800] shadow-md shadow-[#ff7800]/15 text-[#feffff]'
          : 'bg-[#202940] border-[#2e3b5b] hover:border-[#3d4d75] hover:bg-[#25304b] text-[#feffff]/90'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
        {/* Drag handle */}
        <button
          type="button"
          data-testid={`command-drag-handle-${cmd.id}`}
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Reordenar comando #${index + 1}`}
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground shrink-0 rounded-xs hover:bg-[#1c2438]"
        >
          <GripVertical className="size-3.5" />
        </button>

        {/* Ordinal indicator */}
        <span
          data-testid={`command-ordinal-${cmd.id}`}
          className="font-mono text-xs font-bold text-foreground shrink-0 min-w-[24px]"
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
              ? 'bg-[#0284c7]/20 text-[#38bdf8] hover:bg-[#0284c7]/30 border border-[#0284c7]/40'
              : 'bg-[#018934]/20 text-[#0da845] hover:bg-[#018934]/30 border border-[#018934]/40'
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
          className="h-6 px-1.5 text-[11px] font-mono bg-[#1a2236] border border-[#2e3b5b] rounded-sm text-[#feffff] shrink-0"
        >
          {versions.map((ver) => (
            <option key={ver} value={ver}>
              v{ver}
            </option>
          ))}
        </select>

        {/* Device Interface Selector (for devices with multiple interfaces) */}
        {interfaces && interfaces.length > 1 && (
          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <select
              data-testid={`command-interface-${cmd.id}`}
              value={cmd.interfaceId ?? defaultInterface ?? interfaces[0]?.id}
              onChange={(e) => onUpdateInterface(cmd.id, e.target.value)}
              aria-label={`Interfaz del comando #${index + 1}`}
              className="h-6 px-1.5 text-[11px] font-sans bg-[#1a2236] border border-[#2e3b5b] rounded-sm text-[#feffff] shrink-0"
            >
              {interfaces.map((iface) => (
                <option key={iface.id} value={iface.id}>
                  {iface.name.es}
                </option>
              ))}
            </select>
            {(() => {
              const activeIface = interfaces.find(
                (i) => i.id === (cmd.interfaceId ?? defaultInterface ?? interfaces[0]?.id)
              );
              const isStd = activeIface?.kind === 'standard';
              return (
                <span
                  data-testid={`command-interface-badge-${cmd.id}`}
                  className={`px-1 py-0.5 rounded-xs text-[9px] font-bold uppercase tracking-wider ${
                    isStd
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}
                  title={isStd ? 'Estándar abierto' : 'Propietario del fabricante'}
                >
                  {isStd ? 'STD' : 'PROP'}
                </span>
              );
            })()}
          </div>
        )}

        {/* Per-Command Header Length for Header-Positional Devices (Thales) */}
        {isHeaderPositional && (
          <div
            className="flex items-center gap-1 shrink-0 text-[11px] font-mono text-muted-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[10px]">Hdr:</span>
            <input
              type="number"
              min={0}
              max={128}
              value={cmd.headerLength ?? defaultHeaderLen}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0 && val <= 128) {
                  onUpdateCommandHeaderLength(cmd.id, val);
                }
              }}
              data-testid={`command-header-length-${cmd.id}`}
              className="w-12 h-6 px-1 text-center text-[11px] font-mono bg-[#1a2236] border border-[#2e3b5b] rounded-sm text-[#feffff]"
              title="Longitud de cabecera configurable para este comando"
            />
          </div>
        )}

        {/* Live Hardware Execution Toggle for Request Commands */}
        {isRequest && (
          <button
            type="button"
            data-testid={`command-live-switch-${cmd.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLiveExecution(cmd.id, !cmd.liveExecutionEnabled);
            }}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-semibold tracking-wide uppercase transition-colors shrink-0 ${
              cmd.liveExecutionEnabled
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-[#1a2236] text-muted-foreground hover:text-foreground border border-[#2e3b5b]'
            }`}
            title="Activar/desactivar ejecución directa contra Hardware"
            aria-label="Ejecución directa contra Hardware"
          >
            <Radio className="size-2.5" />
            <span>{cmd.liveExecutionEnabled ? 'HW: ON' : 'HW: OFF'}</span>
          </button>
        )}
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

  const handleUpdateInterface = (id: string, interfaceId: string) => {
    if (props.onUpdateInterface) {
      props.onUpdateInterface(id, interfaceId);
    } else if (workspace?.dispatch) {
      workspace.dispatch({
        type: 'UPDATE_COMMAND_INTERFACE',
        payload: { commandId: id, interfaceId }
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

  const handleUpdateCommandHeaderLength = (id: string, len: number) => {
    if (len < 0 || len > 128) return;
    if (props.onUpdateCommandHeaderLength) {
      props.onUpdateCommandHeaderLength(id, len);
    } else if (workspace?.dispatch) {
      workspace.dispatch({
        type: 'UPDATE_COMMAND_HEADER_LENGTH',
        payload: { commandId: id, headerLength: len }
      });
    }
  };

  const handleToggleLiveExecution = (id: string, enabled: boolean) => {
    if (props.onToggleLiveExecution) {
      props.onToggleLiveExecution(id, enabled);
    } else if (workspace?.dispatch) {
      workspace.dispatch({
        type: 'SET_COMMAND_LIVE_EXECUTION',
        payload: { commandId: id, enabled }
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
                    isActive={cmd.id === activeCommandId}
                    versions={availableVersions}
                    interfaces={spec?.interfaces}
                    defaultInterface={spec?.defaultInterface}
                    isHeaderPositional={spec?.framing.type === 'header-positional'}
                    defaultHeaderLen={defaultHeaderLen}
                    onSelect={handleSelectCommand}
                    onDuplicate={handleDuplicateCommand}
                    onDelete={handleDeleteCommand}
                    onUpdateDirection={handleUpdateDirection}
                    onUpdateVersion={handleUpdateVersion}
                    onUpdateInterface={handleUpdateInterface}
                    onUpdateCommandHeaderLength={handleUpdateCommandHeaderLength}
                    onToggleLiveExecution={handleToggleLiveExecution}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
