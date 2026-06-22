/**
 * Deposit gateway — turns "WAL arrived in a player's Privy wallet" into a credited
 * ledger balance, the custodial way.
 *
 * A player's deposit address is their own Privy (server-custodied) Sui wallet.
 * They send WAL to it from anywhere; this sweeps that WAL into the central
 * Sessions float (signed by the player's Privy wallet via MPC) so the float can
 * back withdrawals, and returns the sweep tx digests + amounts for the engine to
 * credit. The sweep tx moves WAL *out of the player's wallet into Sessions*, so
 * the existing SuiCustody/PrivyCustody.confirmDeposit verification accepts the
 * digest unchanged.
 *
 * Robustness:
 *  - **Idempotent.** Each credit is keyed by the sweep tx digest; the player
 *    actor's replay guard credits a digest at most once.
 *  - **Reconciled.** Every call first re-collects recent player→Sessions WAL
 *    transfers, so a sweep that executed but crashed before crediting is healed on
 *    the next attempt (the digest is re-presented; already-credited ones no-op).
 *  - **Gas-safe.** A fresh player wallet has no SUI for gas, so the Sessions wallet
 *    tops it up before the sweep; the top-up dust stays for the next sweep.
 */
export interface DepositCredit {
    digest: string;
    amount: bigint;
}
export interface PrivyPlayer {
    address: string;
    walletId: string;
    publicKey: string;
}
/** The capability the Engine depends on — sweep + reconcile a player's deposits. */
export interface DepositGateway {
    collect(player: PrivyPlayer): Promise<DepositCredit[]>;
}
export interface PrivyDepositGatewayConfig {
    appId: string;
    appSecret: string;
    rpcUrl: string;
    walCoinType: string;
    sessionsExternalId?: string;
}
export declare class PrivyDepositGateway {
    private readonly client;
    private readonly wallets;
    private readonly sessionsSigner;
    private readonly sessionsAddress;
    private readonly walCoinType;
    private constructor();
    static create(cfg: PrivyDepositGatewayConfig): Promise<PrivyDepositGateway>;
    /**
     * Collect everything depositable for a player: recent (possibly uncredited)
     * sweeps plus a fresh sweep of whatever WAL is sitting in their wallet now.
     * Never throws on a single failure mid-batch — returns what it could collect.
     */
    collect(player: PrivyPlayer): Promise<DepositCredit[]>;
    /** Top the player's wallet up with gas if it can't cover a sweep. */
    private ensureGas;
    /** Move all the player's WAL into the Sessions wallet; returns the tx digest. */
    private sweep;
}
