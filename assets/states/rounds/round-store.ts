import inversify from "inversify";

import mobx from "mobx";
import gc from "@sg/game-client-base";
import { HandsStore } from "../hands";

const { inject, injectable } = inversify;

@injectable()
export class RoundStore {
    @inject(HandsStore) protected readonly handsStore: HandsStore;
    @inject(gc.GameConfigs.GameConfigStore) protected readonly gameConfigStore: gc.GameConfigs.GameConfigStore;
    @inject(gc.Player.MainPlayerStore) protected readonly mainPlayerStore: gc.Player.MainPlayerStore;
    constructor() {
        mobx.makeAutoObservable(this);
    }
    isRunning = false;
    roundId = 0;
    action = "";

    get totalBetAmount() {
        return this.handsStore ? Object.values(this.handsStore.hands).reduce((acc, hand) => acc + hand.bet, 0) : 0;
    }

    get minBet() {
        return Math.max(this.gameConfigStore.minBet, this.mainPlayerStore.stakeLevel.minBet);
    }

    get maxBet() {
        return Math.min(this.gameConfigStore.maxBet, this.mainPlayerStore.stakeLevel.maxBet);
    }

    resetForNewRound() {
        this.isRunning = false;
    }
}
