use std::io::{Read, Write};
use std::net::{SocketAddr, TcpStream};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::{Duration, Instant};

const CONTAINER_NAME: &str = "chci-atalla-simulator";
const IMAGE_TAG: &str = "utimaco_atalla_simulator_8.56:latest";
const DEFAULT_PORT: u16 = 7000;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SimulatorStatusInfo {
    pub docker_available: bool,
    pub docker_version: Option<String>,
    pub image_loaded: bool,
    pub container_running: bool,
    pub container_id: Option<String>,
    pub port: u16,
    pub tcp_reachable: bool,
    pub error_message: Option<String>,
}

/// Helper to execute a docker CLI command across platforms (Windows native or Linux/WSL).
fn run_docker_cli(args: &[&str]) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        let mut cmd = Command::new("docker");
        cmd.args(args);
        cmd.stdin(Stdio::null());
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        match cmd.output() {
            Ok(out) => {
                let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
                let stderr = String::from_utf8_lossy(&out.stderr).trim().to_string();
                if out.status.success() {
                    Ok(stdout)
                } else {
                    let err = if !stderr.is_empty() { stderr } else { stdout };
                    Err(err)
                }
            }
            Err(e) => Err(format!("No se pudo ejecutar el comando 'docker': {}", e)),
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // Try native docker first
        let mut cmd = Command::new("docker");
        cmd.args(args);
        cmd.stdin(Stdio::null());
        let res = cmd.output();

        let use_wsl_cmd = match &res {
            Ok(out) => {
                if out.status.success() {
                    return Ok(String::from_utf8_lossy(&out.stdout).trim().to_string());
                }
                let err = String::from_utf8_lossy(&out.stderr);
                err.contains("WSL 2 distro") || err.contains("could not be found")
            }
            Err(_) => true,
        };

        if use_wsl_cmd {
            // Fallback for WSL environment where Docker Desktop runs on Windows host
            let mut wsl_cmd = Command::new("cmd.exe");
            let safe_args: Vec<String> = args
                .iter()
                .map(|arg| {
                    if arg.contains(' ') || arg.contains('"') {
                        format!("\"{}\"", arg.replace('"', "\\\""))
                    } else {
                        arg.to_string()
                    }
                })
                .collect();
            let docker_str = format!("docker {}", safe_args.join(" "));
            wsl_cmd.args(["/c", &docker_str]);
            wsl_cmd.stdin(Stdio::null());
            match wsl_cmd.output() {
                Ok(out) => {
                    let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
                    let stderr = String::from_utf8_lossy(&out.stderr).trim().to_string();
                    if out.status.success() {
                        Ok(stdout)
                    } else {
                        let err = if !stderr.is_empty() { stderr } else { stdout };
                        Err(err)
                    }
                }
                Err(e) => Err(format!("Error invocando docker vía Windows cmd.exe: {}", e)),
            }
        } else {
            let out = res.unwrap();
            let stderr = String::from_utf8_lossy(&out.stderr).trim().to_string();
            let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
            let err = if !stderr.is_empty() { stderr } else { stdout };
            Err(err)
        }
    }
}

/// Helper to convert a path to Windows format if running under WSL/Linux calling cmd.exe
fn normalize_path_for_docker(path_str: &str) -> String {
    #[cfg(not(target_os = "windows"))]
    {
        // Check if wslpath is available
        if let Ok(out) = Command::new("wslpath").args(["-w", path_str]).output() {
            if out.status.success() {
                let p = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if !p.is_empty() {
                    return p;
                }
            }
        }
    }
    path_str.to_string()
}

/// Checks if Docker daemon is responsive.
pub fn check_docker_available() -> Result<String, String> {
    match run_docker_cli(&["version", "--format", "{{.Server.Version}}"]) {
        Ok(v) if !v.is_empty() => Ok(v),
        Ok(_) => Ok("Desconocido".to_string()),
        Err(_) => {
            // Fallback to simple `docker version`
            match run_docker_cli(&["version"]) {
                Ok(out) => {
                    let first_line = out.lines().next().unwrap_or("Disponible").to_string();
                    Ok(first_line)
                }
                Err(e) => Err(format!("Docker no responde o no está en ejecución: {}", e)),
            }
        }
    }
}

/// Checks if the Atalla simulator docker image exists locally.
pub fn check_image_loaded() -> bool {
    match run_docker_cli(&["images", "-q", IMAGE_TAG]) {
        Ok(id) => !id.trim().is_empty(),
        Err(_) => false,
    }
}

/// Checks if the simulator container exists and if it is running.
pub fn check_container_state() -> (bool, Option<String>) {
    // Format: {{.ID}}|{{.Status}}
    match run_docker_cli(&[
        "ps",
        "-a",
        "--filter",
        &format!("name={}", CONTAINER_NAME),
        "--format",
        "{{.ID}}|{{.Status}}",
    ]) {
        Ok(output) => {
            let line = output.lines().next().unwrap_or("").trim();
            if line.is_empty() {
                return (false, None);
            }
            let parts: Vec<&str> = line.split('|').collect();
            let id = parts.first().map(|s| s.to_string());
            let status = parts.get(1).map(|s| s.to_string()).unwrap_or_default();
            let is_running = status.to_lowercase().starts_with("up");
            (is_running, id)
        }
        Err(_) => (false, None),
    }
}

/// Verifies if the local TCP port is reachable.
pub fn check_tcp_port(port: u16) -> bool {
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    TcpStream::connect_timeout(&addr, Duration::from_millis(500)).is_ok()
}

/// Verifies if the Atalla simulator is fully initialized and responding to cryptographic commands.
pub fn check_simulator_ready(port: u16) -> bool {
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    if let Ok(mut stream) = TcpStream::connect_timeout(&addr, Duration::from_millis(600)) {
        let _ = stream.set_read_timeout(Some(Duration::from_millis(1000)));
        let _ = stream.set_write_timeout(Some(Duration::from_millis(600)));
        if stream.write_all(b"<00#TEST#>").is_ok() {
            let mut buf = [0u8; 128];
            if let Ok(n) = stream.read(&mut buf) {
                return n > 0 && String::from_utf8_lossy(&buf[..n]).contains("<00#");
            }
        }
    }
    false
}

/// Automatically locate the Utimaco Atalla simulator .tar file in standard locations.
pub fn find_default_tar_path() -> Option<PathBuf> {
    let candidates = [
        // Adjacent simulator folder
        PathBuf::from("simulators/atalla-at1000/utimaco_atalla_simulator_8.56.tar"),
        PathBuf::from("../simulators/atalla-at1000/utimaco_atalla_simulator_8.56.tar"),
        PathBuf::from("../../simulators/atalla-at1000/utimaco_atalla_simulator_8.56.tar"),
        // Project docs path
        PathBuf::from("docs/Utimaco_Atalla-AT1000/Simulator/Atalla-AT1000-Simulator/utimaco_atalla_simulator_8.56.tar"),
        PathBuf::from("../docs/Utimaco_Atalla-AT1000/Simulator/Atalla-AT1000-Simulator/utimaco_atalla_simulator_8.56.tar"),
        PathBuf::from("../../docs/Utimaco_Atalla-AT1000/Simulator/Atalla-AT1000-Simulator/utimaco_atalla_simulator_8.56.tar"),
    ];

    for candidate in &candidates {
        if candidate.exists() {
            if let Ok(abs) = candidate.canonicalize() {
                return Some(abs);
            }
            return Some(candidate.clone());
        }
    }

    // Try relative to current exe
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            let exe_rel = parent.join("simulators/atalla-at1000/utimaco_atalla_simulator_8.56.tar");
            if exe_rel.exists() {
                return Some(exe_rel);
            }
        }
    }

    None
}

/// Get current full status of the simulator.
#[tauri::command]
pub async fn get_atalla_simulator_status() -> Result<SimulatorStatusInfo, String> {
    let docker_version = match check_docker_available() {
        Ok(v) => Some(v),
        Err(e) => {
            return Ok(SimulatorStatusInfo {
                docker_available: false,
                docker_version: None,
                image_loaded: false,
                container_running: false,
                container_id: None,
                port: DEFAULT_PORT,
                tcp_reachable: false,
                error_message: Some(e),
            });
        }
    };

    let image_loaded = check_image_loaded();
    let (container_running, container_id) = check_container_state();
    let tcp_reachable = if container_running {
        check_simulator_ready(DEFAULT_PORT)
    } else {
        false
    };

    Ok(SimulatorStatusInfo {
        docker_available: true,
        docker_version,
        image_loaded,
        container_running,
        container_id,
        port: DEFAULT_PORT,
        tcp_reachable,
        error_message: None,
    })
}

/// Starts the Atalla simulator: loads tar image if missing, starts or runs container, and waits for port 7000.
#[tauri::command]
pub async fn start_atalla_simulator(
    tar_path: Option<String>,
    port: Option<u16>,
) -> Result<SimulatorStatusInfo, String> {
    let target_port = port.unwrap_or(DEFAULT_PORT);

    // 1. Verify Docker is running
    let docker_ver = check_docker_available().map_err(|e| {
        format!("No se puede iniciar el simulador porque Docker no está disponible: {}", e)
    })?;

    // 2. Check if Docker image is loaded
    let mut image_loaded = check_image_loaded();
    if !image_loaded {
        // Resolve tar path
        let resolved_path = match tar_path {
            Some(p) if !p.is_empty() && Path::new(&p).exists() => PathBuf::from(p),
            _ => find_default_tar_path().ok_or_else(|| {
                "No se encontró la imagen 'utimaco_atalla_simulator_8.56.tar'. Por favor proporcione la ruta del archivo o colóquelo en la carpeta simulators/.".to_string()
            })?,
        };

        let norm_path = normalize_path_for_docker(&resolved_path.to_string_lossy());
        run_docker_cli(&["load", "-i", &norm_path])
            .map_err(|e| format!("Fallo al cargar la imagen Docker desde '{}': {}", norm_path, e))?;

        image_loaded = check_image_loaded();
        if !image_loaded {
            return Err("La imagen Docker se cargó pero no se encuentra registrada bajo el tag esperado.".to_string());
        }
    }

    // 3. Check container status
    let (is_running, existing_id) = check_container_state();
    if is_running {
        // If container is already running AND responding to commands, return immediately!
        if check_simulator_ready(target_port) {
            return Ok(SimulatorStatusInfo {
                docker_available: true,
                docker_version: Some(docker_ver),
                image_loaded: true,
                container_running: true,
                container_id: existing_id,
                port: target_port,
                tcp_reachable: true,
                error_message: None,
            });
        }
        // If running but not yet ready, proceed to wait loop
    } else if existing_id.is_some() {
        // If container exists but is stopped, try starting it
        if let Err(_) = run_docker_cli(&["start", CONTAINER_NAME]) {
            // If starting fails, remove and recreate
            let _ = run_docker_cli(&["rm", "-f", CONTAINER_NAME]);
            let port_arg = format!("127.0.0.1:{}:7000", target_port);
            run_docker_cli(&["run", "-d", "--name", CONTAINER_NAME, "-p", &port_arg, IMAGE_TAG])
                .map_err(|e| format!("Error ejecutando contenedor: {}", e))?;
        }
    } else {
        // Run new container
        let port_arg = format!("127.0.0.1:{}:7000", target_port);
        run_docker_cli(&["run", "-d", "--name", CONTAINER_NAME, "-p", &port_arg, IMAGE_TAG])
            .map_err(|e| format!("Error ejecutando contenedor: {}", e))?;
    }

    // 4. Wait for Atalla simulator and listener (at_hsm_listenerd) to fully boot
    // Vendor entrypoint set_up_config_prm.sh contains sleep intervals (10s + 20s),
    // taking ~32 seconds to reach the listener ready state.
    let start_wait = Instant::now();
    let max_wait = Duration::from_secs(50);
    let mut tcp_ready = false;

    while start_wait.elapsed() < max_wait {
        if check_simulator_ready(target_port) {
            tcp_ready = true;
            break;
        }
        tokio::time::sleep(Duration::from_millis(800)).await;
    }

    let (_, updated_id) = check_container_state();

    Ok(SimulatorStatusInfo {
        docker_available: true,
        docker_version: Some(docker_ver),
        image_loaded: true,
        container_running: true,
        container_id: updated_id,
        port: target_port,
        tcp_reachable: tcp_ready,
        error_message: if tcp_ready {
            None
        } else {
            Some("El contenedor inició pero el listener de comandos Atalla aún está inicializándose.".to_string())
        },
    })
}

/// Stops and cleans up the Atalla simulator container.
#[tauri::command]
pub async fn stop_atalla_simulator() -> Result<SimulatorStatusInfo, String> {
    let docker_ver = check_docker_available().ok();

    // Stop container
    let _ = run_docker_cli(&["stop", CONTAINER_NAME]);
    // Remove container to keep environment clean
    let _ = run_docker_cli(&["rm", "-f", CONTAINER_NAME]);

    let image_loaded = check_image_loaded();
    let (is_running, id) = check_container_state();
    let tcp_reachable = if is_running {
        check_simulator_ready(DEFAULT_PORT)
    } else {
        false
    };

    Ok(SimulatorStatusInfo {
        docker_available: docker_ver.is_some(),
        docker_version: docker_ver,
        image_loaded,
        container_running: is_running,
        container_id: id,
        port: DEFAULT_PORT,
        tcp_reachable,
        error_message: None,
    })
}

/// Retrieves the stdout/stderr logs from the Atalla simulator container.
#[tauri::command]
pub async fn get_atalla_simulator_logs(tail: Option<u32>) -> Result<String, String> {
    let tail_lines = tail.unwrap_or(100).to_string();
    run_docker_cli(&["logs", "--tail", &tail_lines, CONTAINER_NAME])
        .map_err(|e| format!("No se pudieron obtener logs del contenedor: {}", e))
}
