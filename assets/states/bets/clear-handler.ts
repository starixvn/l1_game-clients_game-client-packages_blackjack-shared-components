import inversify from "inversify";
import gc from "@sg/game-client-base";
import { HandHandlers } from "../hands";

const { inject, injectable } = inversify;

@injectable()
export class ClearHandler implements gc.Shared.IHandler<number | undefined> {
    @inject(HandHandlers) protected readonly handHandlers: HandHandlers;

    handle(handsAmount = 1) {
        for (let i = 1; i <= handsAmount; i++) {
            this.handHandlers.clearChip(i);
        }
    }
}
