import { TurboMountController } from "turbo-mount";
import { RHAP_UI } from "react-h5-audio-player";
import { createElement } from "react";

import { playIcon, pauseIcon } from "../../icons"

export default class extends TurboMountController {
  get componentProps() {
    const { 
      track,
      title,
      albumCover,
      artist,
      artistUrl
    } = this.propsValue;

    console.log(this.propsValue);

    return {
      src: track,
      autoPlay: true,
      showJumpControls: false,
      customVolumeControls: false,
      customProgressBarSection: [
        RHAP_UI.PROGRESS_BAR, 
        RHAP_UI.CURRENT_TIME,
        createElement("span", null, "/"), 
        RHAP_UI.DURATION
      ],
      customControlsSection: [
        RHAP_UI.MAIN_CONTROLS,
        createElement(
          "div",
          { class: "player--cover" },
          createElement("img", {src: albumCover}),
        ),
        createElement(
          "div",
          { class: "player--info" },
          createElement("div", { class: "player--title" }, title),
          createElement("a", { href: artistUrl, class: "player--author" }, artist)
        ), 
      ],
      customIcons: {
        play: playIcon,
        pause: pauseIcon
      },
      onEnded: this.nextTrack
    };
  }

  nextTrack(nextTrackUrl) {
    if (nextTrackUrl) {
      this.fetchNextTrack(nextTrackUrl);
    }
  }

  async fetchNextTrack(url) {
    const request = new FetchRequest("POST", url, {
      responseKind: "turbo-stream",
    });
    const response = await request.perform();
    if (!response.ok) {
      console.error("Failed to load next track", response.status);
    }
  }
}
