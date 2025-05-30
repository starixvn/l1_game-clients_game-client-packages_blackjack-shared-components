import inversify from "inversify";
import gc from "@sg/game-client-base";
import { HandsStore } from "./hands-store";
import { RoundStore } from "../rounds";

const { inject, injectable } = inversify;

@injectable()
export class HandHandlers {
    @inject(gc.Player.MainPlayerStore) protected readonly mainPlayerStore: gc.Player.MainPlayerStore;
    @inject(RoundStore) protected readonly roundStore: RoundStore;
    @inject(gc.Bet.BetStore) protected readonly betStore: gc.Bet.BetStore;
    @inject(HandsStore) protected readonly handsStore: HandsStore;
    @inject(gc.GameConfigs.GameSetting) protected readonly gameSetting: gc.GameConfigs.GameSetting;
    @inject(gc.Notices.NoticeStore) protected readonly noticeStore: gc.Notices.NoticeStore;

    placeChip(position: number, amount = 0) {
        const betAmount = amount || this.betStore.amount;
        const currentTotalBetAmount = this.handsStore.totalBetAmount;
        if (this.isValidBet(betAmount + currentTotalBetAmount)) {
            this.handsStore.placeChip(position, betAmount);
            return true;
        }
        return false;
    }

    setActiveHand() {
        this.handsStore.setActiveHand();
    }

    clearChip(position: number) {
        this.handsStore.clearChip(position);
    }

    reset() {
        this.handsStore.reset();
    }

    private isValidBet(amount: number) {
        if (this.roundStore.isRunning) {
            return false;
        }
        if (this.betStore.isProcessingBet) {
            this.showWarningProcessingBet();
        }
        const isReachMaxBet = amount > this.roundStore.maxBet;
        if (isReachMaxBet) {
            this.showWarningReachLimitBet(true);
            return false;
        }
        const isReachMinBet = amount < this.roundStore.minBet;
        if (isReachMinBet) {
            this.showWarningReachLimitBet(false);
            return false;
        }
        if (amount > this.betStore.availableBalance) {
            this.showNoticeNotEnoughBalance();
            return false;
        }
        return true;
    }

    private showWarningProcessingBet() {
        this.noticeStore.addProcessWarning(gc.Translator.commonTranslate("message_processing_action"));
    }

    private showNoticeNotEnoughBalance() {
        const message = this.betStore.freebetEnabled
            ? gc.Translator.commonTranslate("not_enough_scoin")
            : gc.Translator.commonTranslate("not_enough_money");
        this.noticeStore.addWarning(message);
    }

    private showWarningReachLimitBet(isReachMaxBet: boolean) {
        const key = isReachMaxBet ? "max_stake_hand" : "min_bet_hand";
        const params = isReachMaxBet ? { maxBet: this.roundStore.maxBet } : { minBet: this.roundStore.minBet };
        this.noticeStore.addProcessWarning(gc.Translator.commonTranslate(key, params));
    }
}
