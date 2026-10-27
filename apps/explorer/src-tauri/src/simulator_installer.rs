//! Simulator Inventory, Detection, and Runtime Installation Engine

use std::fs::{self, File};
use std::io::{self, BufReader};
use std::path::{Path, PathBuf};

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SimulatorInventoryItem {
    pub id: String,
    pub name: String,
    pub vendor: String,
    pub default_port: u16,
    pub installed: bool,
    pub running: bool,
    pub install_path: Option<String>,
    pub default_download_url: Option<String>,
    pub approx_size_mb: u32,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct InstallResult {
    pub success: bool,
    pub message: String,
    pub install_path: Option<String>,
}

/// Resolves user-writable AppData/local share directory for simulators:
/// - Windows: %APPDATA%\chci\simulators
/// - Linux: ~/.local/share/chci/simulators
/// - macOS: ~/Library/Application Support/chci/simulators
pub fn get_user_simulators_dir() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        if let Ok(appdata) = std::env::var("APPDATA") {
            return PathBuf::from(appdata).join("chci").join("simulators");
        }
    }

    #[cfg(target_os = "macos")]
    {
        if let Ok(home) = std::env::var("HOME") {
            return PathBuf::from(home)
                .join("Library")
                .join("Application Support")
                .join("chci")
                .join("simulators");
        }
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        if let Ok(data_home) = std::env::var("XDG_DATA_HOME") {
            return PathBuf::from(data_home).join("chci").join("simulators");
        }
        if let Ok(home) = std::env::var("HOME") {
            return PathBuf::from(home)
                .join(".local")
                .join("share")
                .join("chci")
                .join("simulators");
        }
    }

    PathBuf::from("simulators")
}

/// Checks candidate directories for a simulator
pub fn find_simulator_dir(sim_id: &str) -> Option<PathBuf> {
    let mut candidates = Vec::new();

    // 1. Current exe directory / simulators / <sim_id>
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            candidates.push(parent.join("simulators").join(sim_id));
        }
    }

    // 2. User AppData directory / <sim_id>
    candidates.push(get_user_simulators_dir().join(sim_id));

    // 3. Working directory / simulators / <sim_id>
    candidates.push(PathBuf::from("simulators").join(sim_id));

    // 4. Windows ProgramData
    #[cfg(target_os = "windows")]
    {
        if let Ok(progdata) = std::env::var("ProgramData") {
            candidates.push(PathBuf::from(progdata).join("CHCI").join("simulators").join(sim_id));
        }
    }

    for dir in candidates {
        if dir.exists() && dir.is_dir() {
            return Some(dir);
        }
    }

    None
}

/// Detects the installation status of all supported hardware simulators
pub fn detect_all_simulators(
    atalla_running: bool,
    atalla_image_loaded: bool,
    thales_running: bool,
    futurex_running: bool,
    liquid_running: bool,
) -> Vec<SimulatorInventoryItem> {
    // 1. Utimaco Atalla AT1000
    let atalla_dir = find_simulator_dir("atalla-at1000");
    let atalla_has_tar = atalla_dir
        .as_ref()
        .map(|d| d.join("utimaco_atalla_simulator_8.56.tar").exists())
        .unwrap_or(false);
    let atalla_installed = atalla_image_loaded || atalla_has_tar;

    // 2. Thales payShield 10K (Built-in Rust engine)
    let thales_dir = find_simulator_dir("thales-payshield");
    let thales_installed = true;

    // 3. Futurex Excrypt Plus (Built-in Rust engine)
    let futurex_dir = find_simulator_dir("futurex-excrypt");
    let futurex_installed = true;

    // 4. Marvell LiquidSecurity (Built-in Rust engine)
    let liquid_dir = find_simulator_dir("marvell-liquidsecurity");
    let liquid_installed = true;

    vec![
        SimulatorInventoryItem {
            id: "atalla-at1000".to_string(),
            name: "Utimaco Atalla AT1000".to_string(),
            vendor: "Utimaco".to_string(),
            default_port: 7000,
            installed: atalla_installed,
            running: atalla_running,
            install_path: atalla_dir.map(|p| p.to_string_lossy().to_string()),
            default_download_url: Some("https://github.com/ramp1953/CryptoCommandExplorer/releases/download/v1.0.0/atalla-at1000.tar".to_string()),
            approx_size_mb: 848,
        },
        SimulatorInventoryItem {
            id: "thales-payshield".to_string(),
            name: "Thales payShield 10K".to_string(),
            vendor: "Thales".to_string(),
            default_port: 1500,
            installed: thales_installed,
            running: thales_running,
            install_path: thales_dir.map(|p| p.to_string_lossy().to_string()),
            default_download_url: Some("https://github.com/ramp1953/CryptoCommandExplorer/releases/download/v1.0.0/thales-payshield.zip".to_string()),
            approx_size_mb: 5,
        },
        SimulatorInventoryItem {
            id: "futurex-excrypt".to_string(),
            name: "Futurex Excrypt Plus".to_string(),
            vendor: "Futurex".to_string(),
            default_port: 9000,
            installed: futurex_installed,
            running: futurex_running,
            install_path: futurex_dir.map(|p| p.to_string_lossy().to_string()),
            default_download_url: Some("https://github.com/ramp1953/CryptoCommandExplorer/releases/download/v1.0.0/futurex-excrypt.zip".to_string()),
            approx_size_mb: 5,
        },
        SimulatorInventoryItem {
            id: "marvell-liquidsecurity".to_string(),
            name: "Marvell LiquidSecurity HSM".to_string(),
            vendor: "Marvell".to_string(),
            default_port: 2225,
            installed: liquid_installed,
            running: liquid_running,
            install_path: liquid_dir.map(|p| p.to_string_lossy().to_string()),
            default_download_url: Some("https://github.com/ramp1953/CryptoCommandExplorer/releases/download/v1.0.0/marvell-liquidsecurity.zip".to_string()),
            approx_size_mb: 5,
        },
    ]
}

/// Installs a simulator from a local file archive (.zip, .tar, .tar.gz, .exe)
pub fn install_from_local_archive(sim_id: &str, file_path_str: &str) -> Result<InstallResult, String> {
    let source_path = Path::new(file_path_str);
    if !source_path.exists() {
        return Err(format!("El archivo especificado no existe: {}", file_path_str));
    }

    let target_dir = get_user_simulators_dir().join(sim_id);
    fs::create_dir_all(&target_dir).map_err(|e| {
        format!("Error creando directorio destino '{}': {}", target_dir.display(), e)
    })?;

    let file_name = source_path.file_name().unwrap_or_default().to_string_lossy().to_string();

    if file_name.ends_with(".zip") {
        let file = File::open(source_path).map_err(|e| format!("Error abriendo archivo zip: {}", e))?;
        let mut archive = zip::ZipArchive::new(BufReader::new(file))
            .map_err(|e| format!("Formato zip no válido: {}", e))?;

        for i in 0..archive.len() {
            let mut file = archive.by_index(i).map_err(|e| format!("Error leyendo entrada zip: {}", e))?;
            let outpath = match file.enclosed_name() {
                Some(path) => target_dir.join(path),
                None => continue,
            };

            if file.is_dir() {
                fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
            } else {
                if let Some(p) = outpath.parent() {
                    if !p.exists() {
                        fs::create_dir_all(p).map_err(|e| e.to_string())?;
                    }
                }
                let mut outfile = File::create(&outpath).map_err(|e| e.to_string())?;
                io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
            }
        }
    } else if file_name.ends_with(".tar.gz") || file_name.ends_with(".tgz") {
        let file = File::open(source_path).map_err(|e| format!("Error abriendo tar.gz: {}", e))?;
        let tar = flate2::read::GzDecoder::new(file);
        let mut archive = tar::Archive::new(tar);
        archive.unpack(&target_dir).map_err(|e| format!("Error descomprimiendo tar.gz: {}", e))?;
    } else if file_name.ends_with(".tar") {
        // If Atalla, copy the tar directly so docker can load it
        if sim_id == "atalla-at1000" {
            let dest_tar = target_dir.join("utimaco_atalla_simulator_8.56.tar");
            fs::copy(source_path, &dest_tar).map_err(|e| format!("Error copiando archivo .tar: {}", e))?;
        } else {
            let file = File::open(source_path).map_err(|e| format!("Error abriendo tar: {}", e))?;
            let mut archive = tar::Archive::new(file);
            archive.unpack(&target_dir).map_err(|e| format!("Error descomprimiendo tar: {}", e))?;
        }
    } else {
        // Single file / binary (.exe)
        let dest = target_dir.join(&file_name);
        fs::copy(source_path, &dest).map_err(|e| format!("Error copiando archivo: {}", e))?;
    }

    Ok(InstallResult {
        success: true,
        message: format!("Simulador '{}' instalado exitosamente.", sim_id),
        install_path: Some(target_dir.to_string_lossy().to_string()),
    })
}
