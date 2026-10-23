//! Standalone CLI Daemon for Futurex Excrypt Simulator

use payment_simulators::futurex_simulator::start_futurex_simulator;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    let port = args
        .iter()
        .position(|r| r == "--port" || r == "-p")
        .and_then(|idx| args.get(idx + 1))
        .and_then(|s| s.parse::<u16>().ok())
        .unwrap_or(9000);

    println!("=======================================================");
    println!("  Futurex Excrypt Native HSM Simulator (v7.6.1)");
    println!("=======================================================");
    println!("Iniciando listener TCP en 127.0.0.1:{}...", port);

    let status = start_futurex_simulator(Some(port)).await?;
    println!("Simulador activo. MFK KCV: {}", status.active_mfk_kcv);
    println!("Presione Ctrl+C para detener el simulador.");

    tokio::signal::ctrl_c().await?;
    println!("\nDeteniendo simulador Futurex...");

    Ok(())
}
