import gc from "@sg/game-client-base";
import inversify from "inversify";
import { HandsStore } from "../hands";
import { RoundStore } from "../rounds";

const { inject, injectable } = inversify;

@injectable()
export class ActionHandlerBase implements gc.Shared.IHandler<void> {
    @inject(gc.Player.MainPlayerStore) protected readonly mainPlayerStore: gc.Player.MainPlayerStore;
    @inject(gc.Bet.BetStore) protected readonly betStore: gc.Bet.BetStore;
    @inject(HandsStore) protected readonly handsStore: HandsStore;
    @inject(RoundStore) protected readonly roundStore: RoundStore;
    @inject(gc.Connection.ConnectionStore) protected readonly connectionStore: gc.Connection.ConnectionStore;
    @inject(gc.Connection.ConnectionHandlers.RetryGameHandler)
    protected readonly retryGameHandler: gc.Connection.ConnectionHandlers.RetryGameHandler;
    @inject(gc.Notices.NoticeStore) protected readonly noticeStore: gc.Notices.NoticeStore;

    protected action = "";

    handle() {
        if (this.isValidBet()) {
            this.roundStore.action = this.action;
            this.updateState();
            const data = this.createBetData();
            this.connectionStore.send(gc.GameClientEmitMessage.Bet.eventName, data);
            this.retryGameHandler.handle();
        }
    }

    updateState() {
        this.betStore.isProcessingBet = true;
        this.roundStore.isRunning = true;
    }

    createBetData(): any {
        return {
            username: this.mainPlayerStore.name,
            freeBet: this.betStore.freebetEnabled,
            clientSentTime: new Date(),
        };
    }

    isValidBet() {
        if (this.betStore.isProcessingBet) {
            this.showWarningProcessingBet();
            return false;
        }
        return true;
    }

    showWarningProcessingBet() {
        this.noticeStore.addProcessWarning(gc.Translator.commonTranslate("message_processing_action"));
    }
}
