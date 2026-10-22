/**
 * @packageDocumentation
 * Cryptographic device catalog listing all supported hardware systems and standards.
 */

import type { DeviceCatalogEntry } from './types';
import { atallaAt1000Spec } from './devices/utimaco-atalla-at1000';
import { thalesPayshield10kSpec } from './devices/thales-payshield-10k';
import { futurexExcryptSpec } from './devices/futurex-excrypt';
import { thalesLuna7Spec } from './devices/thales-luna-7';
import { ibmCca4769Spec } from './devices/ibm-cca-4769';
import { yubicoYubihsm2Spec } from './devices/yubico-yubihsm-2';
import { awsKmsSpec } from './devices/aws-kms';
import { hashicorpVaultSpec } from './devices/hashicorp-vault';
import { marvellLiquidSecuritySpec } from './devices/marvell-liquid-security';
import { azurePaymentHsmSpec } from './devices/azure-payment-hsm';

/**
 * Global catalog of cryptographic hardware modules, payment HSMs, general-purpose HSMs,
 * cloud HSMs as a service, and Key Management Systems (KMS).
 */
export const DEVICE_CATALOG: readonly DeviceCatalogEntry[] = [
  // 1. Payment / Financial HSMs (HSM_FINANCIAL)
  atallaAt1000Spec,
  thalesPayshield10kSpec,
  futurexExcryptSpec,
  ibmCca4769Spec,

  // 2. General-Purpose HSMs (HSM_GP)
  thalesLuna7Spec,
  yubicoYubihsm2Spec,
  marvellLiquidSecuritySpec,

  // 3. Key Management Systems (KMS)
  awsKmsSpec,
  hashicorpVaultSpec,

  // 4. Cloud HSM as a Service (HSMAAS)
  azurePaymentHsmSpec
];
