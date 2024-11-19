import { TurboMount } from "turbo-mount";
import { registerComponent } from "turbo-mount/react";

import AudioPlayer from "react-h5-audio-player";
import PlayerController from "./controllers/player_controller";

const turboMount = new TurboMount();

registerComponent(turboMount, "AudioPlayer", AudioPlayer, PlayerController);
