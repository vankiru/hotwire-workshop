import { TurboMountController } from "turbo-mount";
import { RHAP_UI } from "react-h5-audio-player";
import { createElement, createRef } from "react";
import { FetchRequest } from "@rails/request.js";

import { playIcon, pauseIcon } from "../../icons"

export default class extends TurboMountController {
  static outlets = ["track"];

  get componentProps() {
    const { track } = this.propsValue;
    this.player = createRef();

    return {
      ref: this.player,
      src: track,
      autoPlay: false,
      showJumpControls: false,
      customVolumeControls: false,
      customProgressBarSection: [
        RHAP_UI.PROGRESS_BAR
      ],
      customControlsSection: [
        RHAP_UI.MAIN_CONTROLS,
        this.trackInfo(),
        RHAP_UI.CURRENT_TIME,
        this.timestampsDash(),
        RHAP_UI.DURATION
      ],
      customIcons: {
        play: playIcon,
        pause: pauseIcon
      },
      onCanPlay: this.handleCanPlay,
      onEnded: this.handleEnded
    };
  }

  trackInfo() {
    const {
      title,
      albumCover,
      artist,
      artistUrl
    } = this.propsValue;

    return createElement(
      "div",
      { class: "player--track" },
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
      )
    );
  }

  timestampsDash() {
    return createElement(
      "span",
      { class: "player--timestamps" },
      "\u00A0 / \u00A0"
    );
  }

  trackOutletConnected(outlet, el) {
    const { trackId } = this.propsValue;
    outlet.togglePlayingIfMatch(trackId);
  }

  handleCanPlay = () => {
    // A workaround for autoplay, as it starts
    // audio every time we navigate to a new
    // page causing a cacophony.
    this.player.current.audio.current.play();
  }

  handleEnded = () => {
    const { nextTrackUrl } = this.propsValue;

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
