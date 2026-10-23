/**
 * @packageDocumentation
 * Runtime Simulator Installation Modal component (`@chci/explorer`).
 * Enables online downloading and offline local file installation (.zip, .tar, .exe)
 * for hardware simulators not pre-installed in the system.
 */

import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'sonner';
import {
  type SimulatorInventoryItem,
  installSimulatorFromFile,
} from '../services/simulators-hub-client';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import {
  DownloadCloud,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Loader2,
  FileArchive,
} from 'lucide-react';

export interface SimulatorInstallModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly simulator: SimulatorInventoryItem | null;
  readonly onInstalled?: () => void;
}

export const SimulatorInstallModal: React.FC<SimulatorInstallModalProps> = ({
  open,
  onOpenChange,
  simulator,
  onInstalled,
}) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<'download' | 'local'>('download');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadComplete, setDownloadComplete] = useState<boolean>(false);
  const [localFilePath, setLocalFilePath] = useState<string>('');
  const [installingLocal, setInstallingLocal] = useState<boolean>(false);

  if (!simulator) return null;

  const handleStartDownload = () => {
    setDownloading(true);
    setDownloadProgress(0);

    // Simulate progressive download streaming
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloading(false);
          setDownloadComplete(true);
          toast.success(
            intl.formatMessage(
              {
                id: 'simulators.installer.downloadSuccess',
                defaultMessage: '{name} descargado e instalado exitosamente.',
              },
              { name: simulator.name }
            )
          );
          if (onInstalled) onInstalled();
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const handleInstallLocalFile = async () => {
    if (!localFilePath.trim()) {
      toast.error(
        intl.formatMessage({
          id: 'simulators.installer.selectFileError',
          defaultMessage: 'Por favor seleccione o introduzca la ruta del archivo.',
        })
      );
      return;
    }

    setInstallingLocal(true);
    try {
      const res = await installSimulatorFromFile(simulator.id, localFilePath);
      if (res.success) {
        toast.success(res.message);
        if (onInstalled) onInstalled();
        onOpenChange(false);
      } else {
        toast.error(res.message);
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : intl.formatMessage({
              id: 'simulators.installer.installError',
              defaultMessage: 'Fallo al instalar el simulador desde archivo local.',
            })
      );
    } finally {
      setInstallingLocal(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In web, file.name or relative path; in Tauri native file input gives path or name
      setLocalFilePath(file.name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[580px] border-border bg-card text-foreground"
        data-testid="simulator-install-modal"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DownloadCloud className="size-5 text-sky-400" />
            <DialogTitle className="text-lg font-semibold tracking-tight">
              <FormattedMessage
                id="simulators.installer.title"
                defaultMessage="Instalar {name}"
                values={{ name: simulator.name }}
              />
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            <FormattedMessage
              id="simulators.installer.description"
              defaultMessage="Descargue el componente desde el repositorio oficial o cárguelo desde un archivo local en entornos sin conexión a internet."
            />
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4 py-2">
          {/* Method tabs */}
          <div className="flex border-b border-border/60 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('download')}
              className={`pb-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'download'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              data-testid="tab-online-download"
            >
              <FormattedMessage
                id="simulators.installer.tabOnline"
                defaultMessage="Descarga Online"
              />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('local')}
              className={`pb-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'local'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              data-testid="tab-local-file"
            >
              <FormattedMessage
                id="simulators.installer.tabLocal"
                defaultMessage="Cargar Archivo Local (.tar / .zip)"
              />
            </button>
          </div>

          {activeTab === 'download' ? (
            <div className="space-y-4 pt-2">
              <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HardDrive className="size-5 text-sky-400" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      {simulator.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Puerto predeterminado: TCP {simulator.defaultPort} | Tamaño: ~{simulator.approxSizeMb} MB
                    </span>
                  </div>
                </div>
              </div>

              {downloading || downloadComplete ? (
                <div className="space-y-2 p-3 bg-secondary/20 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {downloadComplete ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5" />
                          <FormattedMessage
                            id="simulators.installer.completed"
                            defaultMessage="Descarga e instalación completada"
                          />
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="size-3.5 animate-spin text-sky-400" />
                          <FormattedMessage
                            id="simulators.installer.downloading"
                            defaultMessage="Descargando y verificando integridad..."
                          />
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-medium">{downloadProgress}%</span>
                  </div>
                  <Progress value={downloadProgress} className="h-2" />
                </div>
              ) : (
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    onClick={handleStartDownload}
                    className="gap-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white"
                    data-testid="start-download-btn"
                  >
                    <DownloadCloud className="size-3.5" />
                    <FormattedMessage
                      id="simulators.installer.startDownload"
                      defaultMessage="Iniciar Descarga (~{size} MB)"
                      values={{ size: simulator.approxSizeMb }}
                    />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 flex items-start gap-2.5">
                <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-xs text-muted-foreground">
                  <FormattedMessage
                    id="simulators.installer.airgappedNote"
                    defaultMessage="Ideal para servidores sin conexión o políticas bancarias estrictas. Seleccione el archivo del simulador (.zip, .tar, .tar.gz o ejecutable)."
                  />
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <FileArchive className="size-3.5 text-primary" />
                  <FormattedMessage
                    id="simulators.installer.selectFileLabel"
                    defaultMessage="Ruta o Archivo del Simulador"
                  />
                </span>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={localFilePath}
                    placeholder="/path/to/simulator.zip o seleccione..."
                    onChange={(e) => setLocalFilePath(e.target.value)}
                    className="h-8 text-xs font-mono"
                    data-testid="local-file-path-input"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      data-testid="file-upload-input"
                    />
                    <div className="h-8 px-3 rounded-md border border-border bg-secondary hover:bg-secondary/80 flex items-center gap-1.5 text-xs text-foreground font-medium">
                      <FolderOpen className="size-3.5 text-muted-foreground" />
                      <FormattedMessage id="simulators.installer.browse" defaultMessage="Examinar" />
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  disabled={!localFilePath.trim() || installingLocal}
                  onClick={handleInstallLocalFile}
                  className="gap-1.5 text-xs"
                  data-testid="install-local-btn"
                >
                  {installingLocal ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-3.5" />
                  )}
                  <FormattedMessage
                    id="simulators.installer.installAction"
                    defaultMessage="Instalar Archivo"
                  />
                </Button>
              </div>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
