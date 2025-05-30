import inversify from "inversify";
import { ActionHandlerBase } from "./action-handler-base";
import { BlackjackActions } from "../../constants";

const { injectable } = inversify;

@injectable()
export class SplitHandler extends ActionHandlerBase {
    protected action = BlackjackActions.SEND_SPLIT;
    createBetData() {
        const data = super.createBetData();
        data.split = { id: this.handsStore.activeHandId };
        return data;
    }
}
