import inversify from "inversify";
import gc from "@sg/game-client-base";
import { BlackjackServiceMessages } from "../blackjack-service-messages";
import { DealerStore } from "../dealer";
import { HandsStore } from "../hands";
import { RoundStore } from "../rounds";
import { BlackjackActions } from "../../constants";

const { inject, injectable } = inversify;

@injectable()
export class SettlementHandlers implements gc.Shared.IMultipleHandlers {
    @inject(DealerStore) protected readonly dealerStore: DealerStore;
    @inject(HandsStore) protected readonly handsStore: HandsStore;
    @inject(RoundStore) protected readonly roundStore: RoundStore;

    handleFinish(finish: BlackjackServiceMessages.Finish) {
        this.dealerStore.setCards(finish.result);
        this.dealerStore.point = finish.settlementResult;
        this.handsStore.settleHands(finish.winningHands);
        this.roundStore.action = BlackjackActions.FINISH;
    }

    eventHandleList = [
        {
            name: BlackjackServiceMessages.Finish.eventName,
            handle: this.handleFinish,
        },
    ];
}
