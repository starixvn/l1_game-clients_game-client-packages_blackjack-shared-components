import inversify from "inversify";
import gc from "@sg/game-client-base";
import { RoundStore } from "../../rounds";
import { BlackjackServiceMessages } from "../../blackjack-service-messages";
import { HandsStore } from "../../hands";
import { DealerStore } from "../../dealer";
import { BlackjackActions } from "../../../constants";

const { inject, injectable } = inversify;

@injectable()
export class StandResponseHandlers implements gc.Shared.IMultipleHandlers {
    @inject(gc.Bet.BetStore) protected readonly betStore: gc.Bet.BetStore;
    @inject(RoundStore) protected readonly roundStore: RoundStore;
    @inject(HandsStore) protected readonly handsStore: HandsStore;
    @inject(DealerStore) protected readonly dealerStore: DealerStore;
    @inject(gc.Connection.ConnectionHandlers.RetryGameHandler)
    protected readonly retryGameHandler: gc.Connection.ConnectionHandlers.RetryGameHandler;

    handleStandResponse(data: BlackjackServiceMessages.Stand) {
        this.roundStore.isRunning = true;
        this.handsStore.setHand(data);
        this.roundStore.action = BlackjackActions.STAND;
    }

    eventHandleList = [{ name: BlackjackServiceMessages.Stand.eventName, handle: this.handleStandResponse }];
}
