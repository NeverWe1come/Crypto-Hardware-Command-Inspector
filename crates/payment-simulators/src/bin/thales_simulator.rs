//! Standalone CLI Daemon for Thales payShield 10K Simulator

use payment_simulators::thales_simulator::start_thales_simulator;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    let port = args
        .iter()
        .position(|r| r == "--port" || r == "-p")
        .and_then(|idx| args.get(idx + 1))
        .and_then(|s| s.parse::<u16>().ok())
        .unwrap_or(1500);

    println!("=======================================================");
    println!("  Thales payShield 10K Native HSM Simulator (v2.3)");
    println!("=======================================================");
    println!("Iniciando listener TCP en 127.0.0.1:{}...", port);

    let status = start_thales_simulator(Some(port)).await?;
    println!("Simulador activo. LMK KCV: {}", status.active_lmk_kcv);
    println!("Presione Ctrl+C para detener el simulador.");

    tokio::signal::ctrl_c().await?;
    println!("\nDeteniendo simulador Thales...");

    Ok(())
}
