import inversify from "inversify";
import { isEmpty } from "lodash-es";
import gc from "@sg/game-client-base";
import { BlackjackServiceMessages } from "../blackjack-service-messages";
import { RoundStore } from "./round-store";
import { HandsStore } from "../hands";
import { DealerStore } from "../dealer";
import { BlackjackActions } from "../../constants";

const { inject, injectable } = inversify;

@injectable()
export class RoundHandlers implements gc.Shared.IMultipleHandlers {
    @inject(RoundStore) protected readonly roundStore: RoundStore;
    @inject(HandsStore) protected readonly handsStore: HandsStore;
    @inject(DealerStore) protected readonly dealerStore: DealerStore;

    handleOwnBets(data: BlackjackServiceMessages.OwnBets) {
        if (!isEmpty(data)) {
            this.roundStore.isRunning = true;
            this.roundStore.roundId = data.roundId;
            this.handsStore.setHands(data.hands);
            this.dealerStore.setCards(data.dealer);
            this.roundStore.action = BlackjackActions.RUNNING;
        } else {
            this.roundStore.action = BlackjackActions.NEW;
        }
    }

    eventHandleList = [{ name: BlackjackServiceMessages.OwnBets.eventName, handle: this.handleOwnBets }];
}
