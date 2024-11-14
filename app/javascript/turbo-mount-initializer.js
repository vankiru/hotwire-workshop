import { TurboMount } from "turbo-mount";
import { registerComponent } from "turbo-mount/react";

import AudioPlayer from "react-h5-audio-player";
import AudioPlayerController from "./controllers/turbo_mount/audio_player_controller";

const turboMount = new TurboMount();

registerComponent(turboMount, "AudioPlayer", AudioPlayer, AudioPlayerController); 
