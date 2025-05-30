import * as Blackjack from "./export";

import gc from "@sg/game-client-base";
const { Auth, Player: Players, Configs, Notification, Undermaintenace: UnderMaintenance, ChipSetting } = gc;

export const features = [Auth, Players, Configs.SiteConfigs, Notification, UnderMaintenance, ChipSetting, Blackjack];
