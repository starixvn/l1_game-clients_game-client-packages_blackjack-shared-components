import inversify from "inversify";
import gc from "@sg/game-client-base";
import { RoundStore } from "../../rounds";
import { BlackjackServiceMessages } from "../../blackjack-service-messages";
import { HandsStore } from "../../hands";
import { DealerStore } from "../../dealer";
import { BlackjackActions } from "../../../constants";

const { inject, injectable } = inversify;

@injectable()
export class SplitResponseHandlers implements gc.Shared.IMultipleHandlers {
    @inject(gc.Bet.BetStore) protected readonly betStore: gc.Bet.BetStore;
    @inject(RoundStore) protected readonly roundStore: RoundStore;
    @inject(HandsStore) protected readonly handsStore: HandsStore;
    @inject(DealerStore) protected readonly dealerStore: DealerStore;
    @inject(gc.Connection.ConnectionHandlers.RetryGameHandler)
    protected readonly retryGameHandler: gc.Connection.ConnectionHandlers.RetryGameHandler;

    handleSplitResponse(data: BlackjackServiceMessages.Split) {
        this.roundStore.isRunning = true;
        data.hands.forEach((hand) => this.handsStore.setHand(hand));
        this.roundStore.action = BlackjackActions.SPLIT;
    }

    eventHandleList = [{ name: BlackjackServiceMessages.Split.eventName, handle: this.handleSplitResponse }];
}
