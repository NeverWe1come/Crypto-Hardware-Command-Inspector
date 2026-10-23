//! Shared Cryptographic Core for Payment HSM Simulators (Thales payShield & Futurex Excrypt)
//!
//! Provides pure Rust implementations for:
//! - 3DES (DES-EDE2, DES-EDE3) in ECB and CBC modes
//! - Key Check Value (KCV) standard calculations
//! - Visa / Mastercard CVV/CVC calculations
//! - ISO 9564-1 Format 0 (ANSI X9.8) PIN block formatting & verification
//! - ISO 9797-1 Algorithm 3 (Retail MAC / ANSI X9.19)

use cipher::{BlockDecrypt, BlockEncrypt, KeyInit};
use des::{Des, TdesEde2, TdesEde3};
use aes::{Aes128, Aes256};

#[derive(Debug, PartialEq, Eq)]
pub enum CryptoError {
    InvalidKeyLength,
    InvalidDataLength,
    InvalidPan,
    InvalidPin,
    HexDecodeError,
}

impl std::fmt::Display for CryptoError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CryptoError::InvalidKeyLength => write!(f, "Invalid key length"),
            CryptoError::InvalidDataLength => write!(f, "Invalid data length (must be multiple of 8 bytes)"),
            CryptoError::InvalidPan => write!(f, "Invalid PAN format or length"),
            CryptoError::InvalidPin => write!(f, "Invalid PIN format (must be 4 to 12 digits)"),
            CryptoError::HexDecodeError => write!(f, "Hexadecimal decoding failed"),
        }
    }
}

impl std::error::Error for CryptoError {}

/// Encrypts data using 3DES ECB.
/// Key can be 8 bytes (Single DES), 16 bytes (Double DES 2TDES), or 24 bytes (Triple DES 3TDES).
pub fn des3_ecb_encrypt(key: &[u8], data: &[u8]) -> Result<Vec<u8>, CryptoError> {
    if data.is_empty() || data.len() % 8 != 0 {
        return Err(CryptoError::InvalidDataLength);
    }

    let mut result = data.to_vec();

    match key.len() {
        8 => {
            let cipher = Des::new_from_slice(key).map_err(|_| CryptoError::InvalidKeyLength)?;
            for chunk in result.chunks_exact_mut(8) {
                let block = cipher::generic_array::GenericArray::from_mut_slice(chunk);
                cipher.encrypt_block(block);
            }
        }
        16 => {
            let cipher = TdesEde2::new_from_slice(key).map_err(|_| CryptoError::InvalidKeyLength)?;
            for chunk in result.chunks_exact_mut(8) {
                let block = cipher::generic_array::GenericArray::from_mut_slice(chunk);
                cipher.encrypt_block(block);
            }
        }
        24 => {
            let cipher = TdesEde3::new_from_slice(key).map_err(|_| CryptoError::InvalidKeyLength)?;
            for chunk in result.chunks_exact_mut(8) {
                let block = cipher::generic_array::GenericArray::from_mut_slice(chunk);
                cipher.encrypt_block(block);
            }
        }
        _ => return Err(CryptoError::InvalidKeyLength),
    }

    Ok(result)
}

/// Decrypts data using 3DES ECB.
pub fn des3_ecb_decrypt(key: &[u8], data: &[u8]) -> Result<Vec<u8>, CryptoError> {
    if data.is_empty() || data.len() % 8 != 0 {
        return Err(CryptoError::InvalidDataLength);
    }

    let mut result = data.to_vec();

    match key.len() {
        8 => {
            let cipher = Des::new_from_slice(key).map_err(|_| CryptoError::InvalidKeyLength)?;
            for chunk in result.chunks_exact_mut(8) {
                let block = cipher::generic_array::GenericArray::from_mut_slice(chunk);
                cipher.decrypt_block(block);
            }
        }
        16 => {
            let cipher = TdesEde2::new_from_slice(key).map_err(|_| CryptoError::InvalidKeyLength)?;
            for chunk in result.chunks_exact_mut(8) {
                let block = cipher::generic_array::GenericArray::from_mut_slice(chunk);
                cipher.decrypt_block(block);
            }
        }
        24 => {
            let cipher = TdesEde3::new_from_slice(key).map_err(|_| CryptoError::InvalidKeyLength)?;
            for chunk in result.chunks_exact_mut(8) {
                let block = cipher::generic_array::GenericArray::from_mut_slice(chunk);
                cipher.decrypt_block(block);
            }
        }
        _ => return Err(CryptoError::InvalidKeyLength),
    }

    Ok(result)
}

/// Encrypts data using AES ECB (AES-128 or AES-256).
pub fn aes_ecb_encrypt(key: &[u8], data: &[u8]) -> Result<Vec<u8>, CryptoError> {
    if data.is_empty() || data.len() % 16 != 0 {
        return Err(CryptoError::InvalidDataLength);
    }

    let mut result = data.to_vec();

    match key.len() {
        16 => {
            let cipher = Aes128::new_from_slice(key).map_err(|_| CryptoError::InvalidKeyLength)?;
            for chunk in result.chunks_exact_mut(16) {
                let block = cipher::generic_array::GenericArray::from_mut_slice(chunk);
                cipher.encrypt_block(block);
            }
        }
        32 => {
            let cipher = Aes256::new_from_slice(key).map_err(|_| CryptoError::InvalidKeyLength)?;
            for chunk in result.chunks_exact_mut(16) {
                let block = cipher::generic_array::GenericArray::from_mut_slice(chunk);
                cipher.encrypt_block(block);
            }
        }
        _ => return Err(CryptoError::InvalidKeyLength),
    }

    Ok(result)
}

/// Decrypts data using AES ECB (AES-128 or AES-256).
pub fn aes_ecb_decrypt(key: &[u8], data: &[u8]) -> Result<Vec<u8>, CryptoError> {
    if data.is_empty() || data.len() % 16 != 0 {
        return Err(CryptoError::InvalidDataLength);
    }

    let mut result = data.to_vec();

    match key.len() {
        16 => {
            let cipher = Aes128::new_from_slice(key).map_err(|_| CryptoError::InvalidKeyLength)?;
            for chunk in result.chunks_exact_mut(16) {
                let block = cipher::generic_array::GenericArray::from_mut_slice(chunk);
                cipher.decrypt_block(block);
            }
        }
        32 => {
            let cipher = Aes256::new_from_slice(key).map_err(|_| CryptoError::InvalidKeyLength)?;
            for chunk in result.chunks_exact_mut(16) {
                let block = cipher::generic_array::GenericArray::from_mut_slice(chunk);
                cipher.decrypt_block(block);
            }
        }
        _ => return Err(CryptoError::InvalidKeyLength),
    }

    Ok(result)
}

/// Calculates Key Check Value (KCV) for AES keys (16 zero bytes encrypted, first 3 bytes hex).
pub fn calculate_aes_kcv(key: &[u8]) -> Result<String, CryptoError> {
    let zeros = [0u8; 16];
    let encrypted = aes_ecb_encrypt(key, &zeros)?;
    Ok(hex::encode_upper(&encrypted[0..3]))
}

/// Calculates Key Check Value (KCV) by encrypting 8 zero bytes with the given key
/// and returning the first 3 bytes (6 hex characters in uppercase).
pub fn calculate_kcv(key: &[u8]) -> Result<String, CryptoError> {
    let zeros = [0u8; 8];
    let encrypted = des3_ecb_encrypt(key, &zeros)?;
    Ok(hex::encode_upper(&encrypted[0..3]))
}

/// Computes Visa / Mastercard CVV (Card Verification Value).
/// - `pan`: 13 to 19 digit Primary Account Number
/// - `exp_date`: 4 digits YYMM
/// - `service_code`: 3 digits
/// - `cvk`: 16-byte CVK (Double-length DES key: CVK_A || CVK_B)
pub fn calculate_cvv(
    pan: &str,
    exp_date: &str,
    service_code: &str,
    cvk: &[u8],
) -> Result<String, CryptoError> {
    if cvk.len() != 16 {
        return Err(CryptoError::InvalidKeyLength);
    }
    if pan.len() < 13 || !pan.chars().all(|c| c.is_ascii_digit()) {
        return Err(CryptoError::InvalidPan);
    }
    if exp_date.len() != 4 || !exp_date.chars().all(|c| c.is_ascii_digit()) {
        return Err(CryptoError::InvalidDataLength);
    }
    if service_code.len() != 3 || !service_code.chars().all(|c| c.is_ascii_digit()) {
        return Err(CryptoError::InvalidDataLength);
    }

    // Concatenate PAN + Exp + Service Code
    let concatenated = format!("{}{}{}", pan, exp_date, service_code);
    
    // Pad with '0' to create two 16-character (8-byte packed) blocks
    let mut block1_str = String::new();
    let mut block2_str = String::new();

    if concatenated.len() <= 16 {
        block1_str.push_str(&concatenated);
        while block1_str.len() < 16 {
            block1_str.push('0');
        }
        block2_str.push_str("0000000000000000");
    } else {
        block1_str.push_str(&concatenated[..16]);
        block2_str.push_str(&concatenated[16..]);
        while block2_str.len() < 16 {
            block2_str.push('0');
        }
    }

    let b1 = hex::decode(&block1_str).map_err(|_| CryptoError::HexDecodeError)?;
    let b2 = hex::decode(&block2_str).map_err(|_| CryptoError::HexDecodeError)?;

    let cvk_a = &cvk[..8];
    let _cvk_b = &cvk[8..16];

    // Encrypt Block 1 with CVK_A
    let enc1 = des3_ecb_encrypt(cvk_a, &b1)?;
    // XOR enc1 with Block 2
    let mut xored = [0u8; 8];
    for i in 0..8 {
        xored[i] = enc1[i] ^ b2[i];
    }

    // Encrypt with CVK (EDE using CVK_A, CVK_B, CVK_A)
    let full_enc = des3_ecb_encrypt(cvk, &xored)?;
    let hex_result = hex::encode_upper(full_enc);

    // Decimalization: extract digits 0-9 first, then convert A-F to 0-5
    let mut digits = String::new();
    let mut alpha_chars = Vec::new();

    for c in hex_result.chars() {
        if c.is_ascii_digit() {
            digits.push(c);
        } else {
            alpha_chars.push(c);
        }
    }

    for c in alpha_chars {
        let dec_val = match c {
            'A' => '0',
            'B' => '1',
            'C' => '2',
            'D' => '3',
            'E' => '4',
            'F' => '5',
            _ => '0',
        };
        digits.push(dec_val);
    }

    if digits.len() < 3 {
        return Err(CryptoError::InvalidDataLength);
    }

    Ok(digits[..3].to_string())
}

/// Formats an ISO 9564-1 Format 0 (ANSI X9.8) PIN Block.
/// `pan`: full PAN (min 13 digits)
/// `pin`: clear PIN (4 to 12 digits)
/// `zpk`: 16-byte Zone PIN Key
pub fn format_iso0_pin_block(pan: &str, pin: &str, zpk: &[u8]) -> Result<String, CryptoError> {
    if zpk.len() != 16 && zpk.len() != 24 {
        return Err(CryptoError::InvalidKeyLength);
    }
    if pin.len() < 4 || pin.len() > 12 || !pin.chars().all(|c| c.is_ascii_digit()) {
        return Err(CryptoError::InvalidPin);
    }
    if pan.len() < 13 || !pan.chars().all(|c| c.is_ascii_digit()) {
        return Err(CryptoError::InvalidPan);
    }

    // PIN Field: 0 || L || PIN || Pad with 'F' to 16 hex chars
    let mut pin_field = format!("0{:X}{}", pin.len(), pin);
    while pin_field.len() < 16 {
        pin_field.push('F');
    }

    // PAN Field: 0000 || 12 rightmost digits of PAN excluding check digit
    let pan_without_check = &pan[..pan.len() - 1];
    let pan_12 = if pan_without_check.len() >= 12 {
        &pan_without_check[pan_without_check.len() - 12..]
    } else {
        pan_without_check
    };
    let pan_field = format!("0000{:0>12}", pan_12);

    let pin_bytes = hex::decode(&pin_field).map_err(|_| CryptoError::HexDecodeError)?;
    let pan_bytes = hex::decode(&pan_field).map_err(|_| CryptoError::HexDecodeError)?;

    let mut clear_block = [0u8; 8];
    for i in 0..8 {
        clear_block[i] = pin_bytes[i] ^ pan_bytes[i];
    }

    let encrypted = des3_ecb_encrypt(zpk, &clear_block)?;
    Ok(hex::encode_upper(encrypted))
}

/// Verifies an ISO-0 PIN block against an expected clear PIN and PAN under a ZPK.
pub fn verify_iso0_pin_block(
    pin_block_hex: &str,
    pan: &str,
    expected_pin: &str,
    zpk: &[u8],
) -> Result<bool, CryptoError> {
    let block_bytes = hex::decode(pin_block_hex).map_err(|_| CryptoError::HexDecodeError)?;
    if block_bytes.len() != 8 {
        return Err(CryptoError::InvalidDataLength);
    }

    let decrypted = des3_ecb_decrypt(zpk, &block_bytes)?;

    let pan_without_check = &pan[..pan.len() - 1];
    let pan_12 = if pan_without_check.len() >= 12 {
        &pan_without_check[pan_without_check.len() - 12..]
    } else {
        pan_without_check
    };
    let pan_field = format!("0000{:0>12}", pan_12);
    let pan_bytes = hex::decode(&pan_field).map_err(|_| CryptoError::HexDecodeError)?;

    let mut clear_pin_field = [0u8; 8];
    for i in 0..8 {
        clear_pin_field[i] = decrypted[i] ^ pan_bytes[i];
    }

    let pin_field_hex = hex::encode_upper(clear_pin_field);
    if !pin_field_hex.starts_with('0') {
        return Ok(false);
    }

    let pin_len_nibble = u8::from_str_radix(&pin_field_hex[1..2], 16).unwrap_or(0) as usize;
    if pin_len_nibble != expected_pin.len() {
        return Ok(false);
    }

    let extracted_pin = &pin_field_hex[2..2 + pin_len_nibble];
    Ok(extracted_pin == expected_pin)
}

/// Computes ISO 9797-1 Algorithm 3 (Retail MAC / ANSI X9.19) using 16-byte key (Key A || Key B).
/// Returns 8-byte (16 hex chars) MAC.
pub fn retail_mac(key: &[u8], data: &[u8]) -> Result<String, CryptoError> {
    if key.len() != 16 {
        return Err(CryptoError::InvalidKeyLength);
    }

    let key_a = &key[..8];
    let key_b = &key[8..16];

    // Method 1 Padding: pad with zeros to multiple of 8 bytes
    let mut padded = data.to_vec();
    if padded.is_empty() || padded.len() % 8 != 0 {
        let remainder = padded.len() % 8;
        let pad_len = if remainder == 0 { 8 } else { 8 - remainder };
        padded.extend(std::iter::repeat(0u8).take(pad_len));
    }

    let cipher_a = Des::new_from_slice(key_a).map_err(|_| CryptoError::InvalidKeyLength)?;
    let cipher_b = Des::new_from_slice(key_b).map_err(|_| CryptoError::InvalidKeyLength)?;

    let mut current_block = [0u8; 8];

    for chunk in padded.chunks_exact(8) {
        for i in 0..8 {
            current_block[i] ^= chunk[i];
        }
        let block = cipher::generic_array::GenericArray::from_mut_slice(&mut current_block);
        cipher_a.encrypt_block(block);
    }

    // Final transformation: Decrypt with Key B, then Encrypt with Key A
    let block = cipher::generic_array::GenericArray::from_mut_slice(&mut current_block);
    cipher_b.decrypt_block(block);
    cipher_a.encrypt_block(block);

    Ok(hex::encode_upper(current_block))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_des3_ecb_roundtrip() {
        let key = hex::decode("0123456789ABCDEFFEDCBA9876543210").unwrap();
        let data = hex::decode("4E6F77206973207468652074696D6521").unwrap(); // 16 bytes

        let encrypted = des3_ecb_encrypt(&key, &data).unwrap();
        assert_ne!(encrypted, data);

        let decrypted = des3_ecb_decrypt(&key, &encrypted).unwrap();
        assert_eq!(decrypted, data);
    }

    #[test]
    fn test_kcv_calculation() {
        let key = hex::decode("0123456789ABCDEFFEDCBA9876543210").unwrap();
        let kcv = calculate_kcv(&key).unwrap();
        assert_eq!(kcv.len(), 6);
        assert_eq!(kcv, "08D7B4");
    }

    #[test]
    fn test_visa_cvv_calculation() {
        let cvk = hex::decode("0123456789ABCDEFFEDCBA9876543210").unwrap();
        let cvv = calculate_cvv("4012888888881881", "8701", "101", &cvk).unwrap();
        assert_eq!(cvv.len(), 3);
        assert!(cvv.chars().all(|c| c.is_ascii_digit()));
    }

    #[test]
    fn test_iso0_pin_block_roundtrip() {
        let zpk = hex::decode("0123456789ABCDEFFEDCBA9876543210").unwrap();
        let pan = "4012888888881881";
        let pin = "1234";

        let pin_block = format_iso0_pin_block(pan, pin, &zpk).unwrap();
        assert_eq!(pin_block.len(), 16);

        let is_valid = verify_iso0_pin_block(&pin_block, pan, pin, &zpk).unwrap();
        assert!(is_valid);

        let wrong_pin = verify_iso0_pin_block(&pin_block, pan, "9999", &zpk).unwrap();
        assert!(!wrong_pin);
    }

    #[test]
    fn test_retail_mac_calculation() {
        let key = hex::decode("0123456789ABCDEFFEDCBA9876543210").unwrap();
        let data = b"ISO 9797-1 MAC TEST DATA STRING";

        let mac = retail_mac(&key, data).unwrap();
        assert_eq!(mac.len(), 16);
    }

    #[test]
    fn test_aes_ecb_roundtrip() {
        let key = hex::decode("000102030405060708090A0B0C0D0E0F").unwrap(); // AES-128
        let data = hex::decode("00112233445566778899AABBCCDDEEFF").unwrap(); // 16 bytes

        let encrypted = aes_ecb_encrypt(&key, &data).unwrap();
        assert_ne!(encrypted, data);

        let decrypted = aes_ecb_decrypt(&key, &encrypted).unwrap();
        assert_eq!(decrypted, data);
    }

    #[test]
    fn test_aes_kcv_calculation() {
        let key = hex::decode("000102030405060708090A0B0C0D0E0F").unwrap();
        let kcv = calculate_aes_kcv(&key).unwrap();
        assert_eq!(kcv.len(), 6);
    }
}
