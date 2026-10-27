//! Standalone CLI Daemon for Marvell LiquidSecurity HSM Simulator

use payment_simulators::liquidsecurity_simulator::start_liquidsecurity_simulator;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    let port = args
        .iter()
        .position(|r| r == "--port" || r == "-p")
        .and_then(|idx| args.get(idx + 1))
        .and_then(|s| s.parse::<u16>().ok())
        .unwrap_or(2225);

    println!("=======================================================");
    println!("  Marvell LiquidSecurity HSM Native Simulator (v3.4.0)");
    println!("=======================================================");
    println!("Iniciando listener TCP en 127.0.0.1:{}...", port);

    let status = start_liquidsecurity_simulator(Some(port)).await?;
    println!("Simulador activo. Firmware: {}, Particiones: {}", status.firmware_version, status.active_partitions);
    println!("Presione Ctrl+C para detener el simulador.");

    tokio::signal::ctrl_c().await?;
    println!("\nDeteniendo simulador LiquidSecurity...");

    Ok(())
}
