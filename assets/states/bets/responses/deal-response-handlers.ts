import inversify from "inversify";
import gc from "@sg/game-client-base";
import { RoundStore } from "../../rounds";
import { BlackjackServiceMessages } from "../../blackjack-service-messages";
import { BlackjackActions } from "../../../constants";
import { HandsStore } from "../../hands";
import { DealerStore } from "../../dealer";
const { inject, injectable } = inversify;

@injectable()
export class DealResponseHandlers implements gc.Shared.IMultipleHandlers {
    @inject(RoundStore) protected readonly roundStore: RoundStore;
    @inject(HandsStore) protected readonly handsStore: HandsStore;
    @inject(DealerStore) protected readonly dealerStore: DealerStore;

    handleDealResponse(data: BlackjackServiceMessages.Deal) {
        this.roundStore.isRunning = true;
        this.roundStore.roundId = data.roundId;
        this.handsStore.setHands(data.hands);
        this.dealerStore.setCards(data.dealer);
        this.roundStore.action = BlackjackActions.DEAL;
    }

    eventHandleList = [{ name: BlackjackServiceMessages.Deal.eventName, handle: this.handleDealResponse }];
}
