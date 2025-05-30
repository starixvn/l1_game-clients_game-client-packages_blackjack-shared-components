import inversify from "inversify";
import gc from "@sg/game-client-base";
import { HandHandlers } from "../hands";
import { DealerStore } from "../dealer";
import { RoundStore } from "../rounds";

const { inject, injectable } = inversify;

@injectable()
export class NewBetHandler implements gc.Shared.IHandler<number | undefined> {
    @inject(HandHandlers) protected readonly handHandlers: HandHandlers;
    @inject(DealerStore) protected readonly dealerStore: DealerStore;
    @inject(RoundStore) protected readonly roundStore: RoundStore;

    handle() {
        this.handHandlers.reset();
        this.dealerStore.reset();
        this.roundStore.resetForNewRound();
    }
}
