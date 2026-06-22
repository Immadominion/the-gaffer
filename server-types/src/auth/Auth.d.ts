/**
 * Auth port — turns a client credential into the player identity (their Sui
 * address). The API depends on this, not on any one provider, so swapping
 * dev-mode for Privy is a composition-root change, not an API change.
 *
 * verify() returns null for a missing/invalid credential (caller treats the
 * request as logged-out) and throws only on genuine server errors.
 */
import type { Wallet } from "../domain/ids";
export interface AuthedUser {
    userId: string;
    wallet: Wallet;
}
export interface Auth {
    verify(token: string): Promise<AuthedUser | null>;
}
