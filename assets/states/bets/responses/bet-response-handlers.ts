import inversify from "inversify";
import gc from "@sg/game-client-base";
import { BlackjackServiceMessages } from "../../blackjack-service-messages";

const { inject, injectable } = inversify;
@injectable()
export class BetResponseHandlers implements gc.Shared.IMultipleHandlers {
    @inject(gc.Bet.BetStore) protected readonly betStore: gc.Bet.BetStore;
    @inject(gc.Connection.ConnectionHandlers.RetryGameHandler)
    protected readonly retryGameHandler: gc.Connection.ConnectionHandlers.RetryGameHandler;

    handleBetResponse(endBet: number) {
        this.stopProcessingBetAndClearInterval();
        this.betStore.lastReceivedBet = { value: endBet, isAnimated: true };
    }

    stopProcessingBetAndClearInterval() {
        this.betStore.isProcessingBet = false;
        this.retryGameHandler.clearInterval();
    }

    eventHandleList = [
        {
            name: gc.GameServiceMessage.BetResponse.eventName,
            handle: this.handleBetResponse,
        },
        { name: BlackjackServiceMessages.Hit.eventName, handle: this.stopProcessingBetAndClearInterval },
        { name: BlackjackServiceMessages.Stand.eventName, handle: this.stopProcessingBetAndClearInterval },
    ];
}
