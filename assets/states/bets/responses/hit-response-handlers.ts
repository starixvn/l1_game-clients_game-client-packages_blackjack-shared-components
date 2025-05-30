import inversify from "inversify";
import gc from "@sg/game-client-base";
import { RoundStore } from "../../rounds";
import { BlackjackServiceMessages } from "../../blackjack-service-messages";
import { HandsStore } from "../../hands";
import { DealerStore } from "../../dealer";
import { BlackjackActions } from "../../../constants";
const { inject, injectable } = inversify;

@injectable()
export class HitResponseHandlers implements gc.Shared.IMultipleHandlers {
    @inject(gc.Bet.BetStore) protected readonly betStore: gc.Bet.BetStore;
    @inject(RoundStore) protected readonly roundStore: RoundStore;
    @inject(HandsStore) protected readonly handsStore: HandsStore;
    @inject(DealerStore) protected readonly dealerStore: DealerStore;
    @inject(gc.Connection.ConnectionHandlers.RetryGameHandler)
    protected readonly retryGameHandler: gc.Connection.ConnectionHandlers.RetryGameHandler;

    handleHitResponse(data: BlackjackServiceMessages.Hit) {
        this.setData(data);
        this.roundStore.action = BlackjackActions.HIT;
    }

    handleDoubleResponse(data: BlackjackServiceMessages.Double) {
        this.setData(data);
        this.roundStore.action = BlackjackActions.DOUBLE;
    }

    setData(data: BlackjackServiceMessages.Hit | BlackjackServiceMessages.Double) {
        this.roundStore.isRunning = true;
        this.handsStore.setHand(data);
    }

    eventHandleList = [
        { name: BlackjackServiceMessages.Hit.eventName, handle: this.handleHitResponse },
        { name: BlackjackServiceMessages.Double.eventName, handle: this.handleDoubleResponse },
    ];
}
