/**
 * The Engine — the application service. It owns the write side: player commands
 * route to actors; match lifecycle (open → lock → resolve) and the settlement
 * saga run here. The API talks to the Engine for commands and to the ReadModel
 * for queries. Match streams have a single writer (this Engine), player streams a
 * single writer each (their actor), so ordering is guaranteed everywhere.
 */
import type { GameConfig } from "../config";
import { type Frost, type MarketId, type MatchId, type Wallet } from "../domain/ids";
import { type Fixture, type MarketDef, type VerdictTrigger } from "../domain/model";
import type { Gaffer } from "../gaffer/Gaffer";
import { ActorRegistry } from "../core/actor/ActorRegistry";
import type { EventStore } from "../core/eventstore/EventStore";
import type { ReadModel } from "../core/projections/ReadModel";
import type { Custody } from "../ports/Custody";
import type { MatchDataProvider } from "../ports/MatchData";
import type { MakeCallInput } from "../core/actor/PlayerActor";
export interface EngineDeps {
    store: EventStore;
    readModel: ReadModel;
    custody: Custody;
    gaffer: Gaffer;
    matchData: MatchDataProvider;
    config: GameConfig;
}
export declare class Engine {
    private readonly deps;
    readonly registry: ActorRegistry;
    private readonly matchVersions;
    constructor(deps: EngineDeps);
    get readModel(): ReadModel;
    get custody(): Custody;
    signContract(wallet: Wallet, handle?: string): Promise<{
        wallet: Wallet;
    }>;
    deposit(wallet: Wallet, amount: Frost, proof?: string): Promise<{
        balance: Frost;
    }>;
    withdraw(wallet: Wallet, amount: Frost): Promise<{
        balance: Frost;
        ref: string;
        net: Frost;
        fee: Frost;
    }>;
    claimWelcomeGrant(wallet: Wallet): Promise<{
        bonus: Frost;
    }>;
    makeCall(wallet: Wallet, input: MakeCallInput): Promise<{
        callId: import("../domain/ids").CallId;
        impliedProbAtCall: number;
    }>;
    declareHotTake(wallet: Wallet, text: string): Promise<{
        takeId: string;
    }>;
    requestVerdict(wallet: Wallet, trigger: VerdictTrigger): Promise<import("../gaffer/Gaffer").Verdict & {
        verdictId: string;
    }>;
    chat(wallet: Wallet, message: string): Promise<string>;
    /** Re-read a player's memory, distil behavioural traits, and persist them. */
    refreshTraits(wallet: Wallet): Promise<import("../gaffer/Gaffer").DistilledTrait[]>;
    /** The pre-bet coaching read — built from live pot context + the player's memory. */
    preBetRead(wallet: Wallet, input: {
        matchId: MatchId;
        marketId: MarketId;
        bucket: string;
        stake: Frost;
    }): Promise<string>;
    openMatch(fixture: Fixture, extraMarkets?: MarketDef[]): Promise<void>;
    lockMatch(matchId: MatchId): Promise<void>;
    resolveMatch(matchId: MatchId, score: {
        home: number;
        away: number;
    }, source?: string): Promise<void>;
    private settleMarket;
    syncFixtures(): Promise<void>;
    /** Lock kicked-off matches; resolve finished ones. Safe to call on a timer. */
    tick(now?: number): Promise<void>;
    private matchAppend;
}
