/**
 * Configuration. One typed object assembled from the environment, with safe
 * defaults so the system boots fully in-memory (no keys, no network) for dev,
 * tests, and the smoke run.
 */
import type { Frost } from "./domain/ids";
import type { RateLimitConfig } from "./engine/RateLimiter";
export interface GameConfig {
    rakeBps: number;
    minParticipants: number;
    minStake: Frost;
    namespacePrefix: string;
    welcomeGrant: Frost;
    withdrawFeeBps: number;
    withdrawFeeMin: Frost;
    rateLimits: RateLimitConfig;
    house: HouseConfig;
}
export interface HouseConfig {
    enabled: boolean;
    botCount: number;
    seedStake: Frost;
    bankrollPerBot: Frost;
    liquidityCap: Frost;
}
export interface AppConfig {
    port: number;
    /** Durable event-log path (SQLite). Unset → in-memory (state lost on restart). */
    eventLogPath?: string;
    /** Secret that gates the demo "resolve match now" endpoint. Unset → disabled. */
    demoAdminKey?: string;
    anthropicApiKey?: string;
    /** The Gaffer's voice. Cheapest capable model by default; verdict can upgrade. */
    models: {
        default: string;
        verdict: string;
    };
    memwal?: {
        privateKey: string;
        accountId: string;
        serverUrl?: string;
    };
    football?: {
        apiKey: string;
        baseUrl: string;
        competitions: {
            league: number;
            season: number;
        }[];
        cacheTtlMs: number;
    };
    /** football-data.org — free tier covers the live World Cup (code "WC"). */
    footballData?: {
        apiKey: string;
        baseUrl: string;
        competitions: string[];
        cacheTtlMs: number;
    };
    sui: {
        rpcUrl: string;
        sessionsAddress?: string;
        sessionsKey?: string;
        walCoinType?: string;
        /** Opt in to Privy MPC custody (no env-var key) instead of the raw keypair. */
        privyCustody?: boolean;
        /** external_id of the Sessions Privy wallet (default "gaffer_sessions"). */
        sessionsExternalId?: string;
    };
    /** Auth / embedded wallets (Privy). Verified server-side; users never see crypto. */
    privy?: {
        appId: string;
        appSecret?: string;
        verificationKey?: string;
    };
    game: GameConfig;
}
export declare function loadConfig(env?: Record<string, string | undefined>): AppConfig;
