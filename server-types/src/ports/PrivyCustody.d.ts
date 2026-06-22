/**
 * Privy MPC custody — the Sessions wallet's key never exists as a raw secret.
 *
 * Where SuiCustody loads an Ed25519Keypair from an env var (the #1 production
 * risk), here the Sessions wallet is a Privy server wallet and outbound payouts
 * are signed via Privy `rawSign` — the key is held in Privy's MPC, never in our
 * process or environment. Deposit verification is byte-for-byte the same as
 * SuiCustody (read-only chain reads, no signing); only the *signing* seam differs.
 *
 * Proven end-to-end on testnet (scripts/privy-sui-sign-testnet.ts): the wallet's
 * public key derives its address, and rawSign over the Sui intent digest yields a
 * signature that verifies under that pubkey.
 */
import type { Frost, Wallet } from "../domain/ids";
import { type Custody, type CustodyRef } from "./Custody";
export interface PrivyCustodyConfig {
    appId: string;
    appSecret: string;
    rpcUrl: string;
    walCoinType: string;
    /** Deterministic external_id for the Sessions Privy wallet. */
    sessionsExternalId?: string;
}
export declare class PrivyCustody implements Custody {
    private readonly client;
    private readonly signer;
    private readonly address;
    private readonly walCoinType;
    private constructor();
    /** Provision (get-or-create) the Sessions Privy wallet, then build the adapter. */
    static create(cfg: PrivyCustodyConfig): Promise<PrivyCustody>;
    sessionsAddress(): string;
    /** Identical to SuiCustody — read-only on-chain verification, no signing. */
    confirmDeposit(wallet: Wallet, amount: Frost, proof?: string): Promise<CustodyRef>;
    /** Pay `amount` FROST of WAL from the Sessions wallet to the player — Privy-signed. */
    withdraw(wallet: Wallet, amount: Frost): Promise<CustodyRef>;
    /** Ops helper (not part of the port): current Sessions balances in base units. */
    balances(): Promise<{
        sui: bigint;
        wal: bigint;
    }>;
}
