import inversify from "inversify";
import { ActionHandlerBase } from "./action-handler-base";
import { BlackjackActions } from "../../constants";

const { injectable } = inversify;

@injectable()
export class HitHandler extends ActionHandlerBase {
    protected action = BlackjackActions.SEND_HIT;

    createBetData() {
        const data = super.createBetData();
        data.hit = { id: this.handsStore.activeHandId };
        return data;
    }
}
