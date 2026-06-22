/**
 * Custody — the money seam. The in-app balance/Pots are a pure event-sourced
 * ledger; real WAL only crosses the chain on deposit and withdraw. This port is
 * the *only* place that knows whether stakes are real WAL settled by the
 * dedicated Sessions wallet, or a play-money season token.
 *
 *   - PlayLedgerCustody:  no chain. Deposits are granted, withdrawals are notional.
 *                          Runs the whole game end-to-end with zero on-chain risk.
 *   - SuiCustody:          real WAL via the Sessions wallet on Sui. Verifies inbound
 *                          deposits and signs outbound payouts. The Sessions wallet
 *                          key never leaves this adapter.
 */
import type { Frost, Wallet } from "../domain/ids";
export interface CustodyRef {
    ref: string;
}
export interface Custody {
    /** The dedicated Sessions wallet address (a hackathon requirement). */
    sessionsAddress(): string;
    /**
     * Confirm an inbound deposit (player → Sessions wallet). For real WAL this
     * verifies the on-chain transfer (identified by `proof`); for play money it
     * simply grants the credit.
     */
    confirmDeposit(wallet: Wallet, amount: Frost, proof?: string): Promise<CustodyRef>;
    /** Execute a withdrawal (Sessions wallet → player). */
    withdraw(wallet: Wallet, amount: Frost): Promise<CustodyRef>;
}
export declare class PlayLedgerCustody implements Custody {
    private readonly address;
    constructor(address?: string);
    sessionsAddress(): string;
    confirmDeposit(_wallet: Wallet, _amount: Frost, _proof?: string): Promise<CustodyRef>;
    withdraw(_wallet: Wallet, _amount: Frost): Promise<CustodyRef>;
}
export interface SuiCustodyConfig {
    rpcUrl: string;
    sessionsAddress: string;
    sessionsKey: string;
    walCoinType: string;
}
/**
 * Real-WAL custody via Sui. The Sessions wallet is the escrow/resolver: deposits
 * are verified against the chain, payouts are signed locally. Everything in/out
 * is denominated in FROST (1 WAL = 1e9 FROST), matching the in-app ledger.
 */
export declare class SuiCustody implements Custody {
    private readonly client;
    private readonly keypair;
    private readonly address;
    private readonly walCoinType;
    constructor(cfg: SuiCustodyConfig);
    sessionsAddress(): string;
    /**
     * Verify a player's inbound WAL deposit. `proof` is the digest of the transfer
     * the player (or their embedded wallet) submitted to the Sessions wallet. We
     * confirm on-chain that it finalised successfully, moved at least `amount` WAL
     * INTO the Sessions wallet, and that the WAL left the *player's own* address —
     * so one player can't credit themselves with another's deposit digest. The
     * digest is returned as the ref; the actor dedups it per player against replay.
     */
    confirmDeposit(wallet: Wallet, amount: Frost, proof?: string): Promise<CustodyRef>;
    /** Pay `amount` FROST of WAL from the Sessions wallet to the player. */
    withdraw(wallet: Wallet, amount: Frost): Promise<CustodyRef>;
    /** Ops helper (not part of the port): current Sessions balances in base units. */
    balances(): Promise<{
        sui: bigint;
        wal: bigint;
    }>;
}
