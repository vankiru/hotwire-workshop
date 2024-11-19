import { TurboMountController } from "turbo-mount";
import { RHAP_UI } from "react-h5-audio-player";
import { createElement, createRef } from "react";
import { FetchRequest } from "@rails/request.js";

import { playIcon, pauseIcon, signalIcon, radioIcon } from "../../icons"

export default class extends TurboMountController {
  static outlets = ["track"];

  get componentProps() {
    const { track } = this.propsValue;
    this.player = createRef();

    return {
      ref: this.player,
      src: track.src,
      autoPlay: false,
      showJumpControls: false,
      customVolumeControls: false,
      customProgressBarSection: [
        RHAP_UI.PROGRESS_BAR
      ],
      customControlsSection: this.controlsSection(),
      customIcons: {
        play: playIcon,
        pause: pauseIcon
      },
      onCanPlay: this.handleCanPlay,
      onEnded: this.handleEnded
    };
  }

  controlsSection() {
    const { station } = this.propsValue;

    return [
      station ? this.stationInfo() : RHAP_UI.MAIN_CONTROLS,
      this.trackInfo(),
      RHAP_UI.CURRENT_TIME,
      this.timestampsDash(),
      RHAP_UI.DURATION
    ]
  }

  stationInfo() {
    const { station } = this.propsValue;

    if (station.live) {
      return createElement(
        "div",
        { class: "player--radio" },
        createElement("span", { class: "player--signal-icon" }, signalIcon),
        createElement("a", { href: station.url, class: "player--title ml-2" }, "Live!")
      );
    } else {
      return createElement(
        "div",
        { class: "player--radio" },
        radioIcon,
        createElement("span", { class: "player--author ml-2" }, station.name),
        createElement("div", { dangerouslySetInnerHTML: { __html: station.stream } })
      )
    }
  }

  trackInfo() {
    const { track } = this.propsValue;

    return createElement(
      "div",
      { class: "player--track" },
      createElement(
        "div",
        { class: "player--cover" },
        createElement("img", {src: track.albumCover}),
      ),
      createElement(
        "div",
        { class: "player--info" },
        createElement("div", { class: "player--title" }, track.title),
        createElement("a", { href: track.artistUrl, class: "player--author" }, track.artist)
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
    const { track } = this.propsValue;
    outlet.togglePlayingIfMatch(track.id);
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
