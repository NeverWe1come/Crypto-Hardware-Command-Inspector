use std::io::{Read, Write};
use std::net::{SocketAddr, TcpStream, ToSocketAddrs};
use std::time::Duration;

#[derive(serde::Deserialize)]
pub struct HardwareCommandRequest {
    pub host: String,
    pub port: u16,
    pub connection_type: String,
    pub payload: String,
    pub framing_type: Option<String>,
    pub timeout_ms: Option<u64>,
    pub ca_cert_pem: Option<String>,
    pub client_cert_pem: Option<String>,
    pub client_key_pem: Option<String>,
}

#[derive(serde::Serialize)]
pub struct HardwareCommandResponse {
    pub success: bool,
    pub response: Option<String>,
    pub error: Option<String>,
    pub elapsed_ms: u64,
}

#[tauri::command]
async fn send_hardware_command(
    request: HardwareCommandRequest,
) -> Result<HardwareCommandResponse, String> {
    let start = std::time::Instant::now();
    let timeout = Duration::from_millis(request.timeout_ms.unwrap_or(5000));

    if request.connection_type == "TLS" || request.connection_type == "mTLS" {
        return Ok(HardwareCommandResponse {
            success: false,
            response: None,
            error: Some(format!(
                "Las conexiones cifradas {} requieren túnel proxy seguro local en esta versión preliminar. Configure una conexión TCP directa a la IP/puerto de su HSM o proxy.",
                request.connection_type
            )),
            elapsed_ms: start.elapsed().as_millis() as u64,
        });
    }

    // Resolve address
    let host_port = format!("{}:{}", request.host, request.port);
    let mut addrs_iter = match host_port.to_socket_addrs() {
        Ok(iter) => iter,
        Err(e) => {
            return Ok(HardwareCommandResponse {
                success: false,
                response: None,
                error: Some(format!("Error resolviendo host '{}': {}", request.host, e)),
                elapsed_ms: start.elapsed().as_millis() as u64,
            });
        }
    };

    let target_addr: SocketAddr = match addrs_iter.next() {
        Some(a) => a,
        None => {
            return Ok(HardwareCommandResponse {
                success: false,
                response: None,
                error: Some(format!("No se encontraron direcciones IP para '{}'", request.host)),
                elapsed_ms: start.elapsed().as_millis() as u64,
            });
        }
    };

    // Connect TCP socket with timeout
    let mut stream = match TcpStream::connect_timeout(&target_addr, timeout) {
        Ok(s) => s,
        Err(e) => {
            return Ok(HardwareCommandResponse {
                success: false,
                response: None,
                error: Some(format!("Fallo de conexión TCP con {}: {}", target_addr, e)),
                elapsed_ms: start.elapsed().as_millis() as u64,
            });
        }
    };

    let _ = stream.set_read_timeout(Some(timeout));
    let _ = stream.set_write_timeout(Some(timeout));

    // Prepare bytes according to device framing
    let mut data_to_send = Vec::new();
    let framing = request.framing_type.as_deref().unwrap_or("");

    if framing == "header-positional" {
        // Standard TCP transport for Thales: 2-byte big-endian message length prefix
        let payload_bytes = request.payload.as_bytes();
        let len = payload_bytes.len() as u16;
        data_to_send.extend_from_slice(&len.to_be_bytes());
        data_to_send.extend_from_slice(payload_bytes);
    } else {
        // Delimited / Tag-Value / Raw ASCII commands (Atalla / Futurex)
        data_to_send.extend_from_slice(request.payload.as_bytes());
    }

    // Send payload
    if let Err(e) = stream.write_all(&data_to_send) {
        return Ok(HardwareCommandResponse {
            success: false,
            response: None,
            error: Some(format!("Error enviando datos al socket: {}", e)),
            elapsed_ms: start.elapsed().as_millis() as u64,
        });
    }
    let _ = stream.flush();

    // Read response
    let mut buffer = [0u8; 4096];
    let bytes_read = match stream.read(&mut buffer) {
        Ok(n) => n,
        Err(e) => {
            return Ok(HardwareCommandResponse {
                success: false,
                response: None,
                error: Some(format!("Timeout o error leyendo respuesta del HSM: {}", e)),
                elapsed_ms: start.elapsed().as_millis() as u64,
            });
        }
    };

    if bytes_read == 0 {
        return Ok(HardwareCommandResponse {
            success: false,
            response: None,
            error: Some("El dispositivo cerró la conexión TCP sin devolver datos.".to_string()),
            elapsed_ms: start.elapsed().as_millis() as u64,
        });
    }

    // Process read bytes (skipping 2-byte length header if Thales header-positional)
    let response_slice = if framing == "header-positional" && bytes_read >= 2 {
        let expected_len = u16::from_be_bytes([buffer[0], buffer[1]]) as usize;
        if expected_len <= bytes_read - 2 {
            &buffer[2..2 + expected_len]
        } else {
            &buffer[2..bytes_read]
        }
    } else {
        &buffer[..bytes_read]
    };

    let response_str = String::from_utf8_lossy(response_slice).trim().to_string();

    Ok(HardwareCommandResponse {
        success: true,
        response: Some(response_str),
        error: None,
        elapsed_ms: start.elapsed().as_millis() as u64,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![send_hardware_command])
        .run(tauri::generate_context!())
        .expect("error while running chci desktop application");
}
