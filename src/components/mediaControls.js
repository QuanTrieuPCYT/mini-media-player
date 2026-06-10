import { LitElement, html, css } from 'lit';
import { classMap } from 'lit/directives/class-map';

import { ICON, REPEAT_STATE } from '../const';
import sharedStyle from '../sharedStyle';

class MiniMediaPlayerMediaControls extends LitElement {
  static get properties() {
    return {
      player: {},
      config: {},
      break: Boolean,
    };
  }

  get showShuffle() {
    return !this.config.hide.shuffle && this.player.supportsShuffle;
  }

  get showRepeat() {
    return !this.config.hide.repeat && this.player.supportsRepeat;
  }

  get maxVol() {
    return this.config.max_volume || 100;
  }

  get minVol() {
    return this.config.min_volume || 0;
  }

  get vol() {
    return Math.round(this.player.vol * 100);
  }

  get jumpAmount() {
    return this.config.jump_amount || 10;
  }

  fireHaptic(intensity = 'light') {
    window.dispatchEvent(new CustomEvent('haptic', { detail: intensity }));
  }

  render() {
    const { hide } = this.config;
    return html`
      ${!hide.volume ? this.renderVolControls(this.player.muted) : html``}
      ${this.renderShuffleButton()}
      ${this.renderRepeatButton()}
      ${!hide.controls ? html`
        <div class='flex mmp-media-controls__media' ?flow=${this.config.flow || this.break}>
          ${!hide.prev && this.player.supportsPrev ? html`
            <ha-icon-button
              @click=${e => { this.fireHaptic(); this.player.prev(e); }}
              .icon=${ICON.PREV}>
             <ha-icon .icon=${ICON.PREV}></ha-icon>
            </ha-icon-button>` : ''}
          ${this.renderJumpBackwardButton()}
          ${this.renderPlayButtons()}
          ${this.renderJumpForwardButton()}
          ${!hide.next && this.player.supportsNext ? html`
            <ha-icon-button
              @click=${e => { this.fireHaptic(); this.player.next(e); }}
              .icon=${ICON.NEXT}>
             <ha-icon .icon=${ICON.NEXT}></ha-icon>
            </ha-icon-button>` : ''}
        </div>
      ` : html``}
    `;
  }

  renderShuffleButton() {
    return this.showShuffle ? html`
      <div class='flex mmp-media-controls__shuffle'>
        <ha-icon-button
          class='shuffle-button'
          @click=${e => { this.fireHaptic(); this.player.toggleShuffle(e); }}
          .icon=${ICON.SHUFFLE}
          ?color=${this.player.shuffle}>
          <ha-icon .icon=${ICON.SHUFFLE}></ha-icon>
        </ha-icon-button>
      </div>
    ` : html``;
  }

  renderRepeatButton() {
    if (!this.showRepeat) return html``;

    const colored = [REPEAT_STATE.ONE, REPEAT_STATE.ALL].includes(this.player.repeat);
    return html`
      <div class='flex mmp-media-controls__repeat'>
        <ha-icon-button
          class='repeat-button'
          @click=${e => { this.fireHaptic(); this.player.toggleRepeat(e); }}
          .icon=${ICON.REPEAT[this.player.repeat]}
          ?color=${colored}>
          <ha-icon .icon=${ICON.REPEAT[this.player.repeat]}></ha-icon>
        </ha-icon-button>
      </div>
    `;
  }

  renderVolControls(muted) {
    const volumeControls = this.config.volume_stateless
      ? this.renderVolButtons(muted)
      : this.renderVolSlider(muted);

    const classes = classMap({
      '--buttons': this.config.volume_stateless,
      'mmp-media-controls__volume': true,
      flex: true,
    });

    const showVolumeLevel = !this.config.hide.volume_level;
    return html`
      <div class=${classes}>
        ${volumeControls}
        ${showVolumeLevel ? this.renderVolLevel() : ''}
      </div>`;
  }

  renderVolSlider(muted) {
    const percent = Math.round(this.player.vol * 100);
    return html`
      <div style="display: flex; align-items: center; flex: 1;">
        ${this.renderMuteButton(muted)}
        <div class="vol-slider-wrapper" style="--slider-value: ${percent};">
          <input
            type="range"
            class="native-vol-slider"
            @change=${this.handleVolumeChange}
            @input=${(e) => {
              const val = e.target.value;
              const wrapper = e.target.parentElement;
              wrapper.style.setProperty('--slider-value', val);
              wrapper.querySelector('.vol-tooltip-value').innerText = val;
            }}
            @click=${e => e.stopPropagation()}
            ?disabled=${muted}
            min=${this.minVol} max=${this.maxVol}
            .value=${percent}
            step=${this.config.volume_step || 1}
          />
          <div class="vol-tooltip-wrapper">
            <div class="vol-tooltip-shape">
              <span class="vol-tooltip-value">${percent}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderVolButtons(muted) {
    return html`
      ${this.renderMuteButton(muted)}
      <ha-icon-button
        @click=${e => { this.fireHaptic(); this.player.volumeDown(e); }}
        .icon=${ICON.VOL_DOWN}>
          <ha-icon .icon=${ICON.VOL_DOWN}></ha-icon>
      </ha-icon-button>
      <ha-icon-button
        @click=${e => { this.fireHaptic(); this.player.volumeUp(e); }}
        .icon=${ICON.VOL_UP}>
          <ha-icon .icon=${ICON.VOL_UP}></ha-icon>
      </ha-icon-button>
    `;
  }

  renderVolLevel() {
    return html`
      <span class="mmp-media-controls__volume__level">${this.vol}%</span>
    `;
  }

  renderMuteButton(muted) {
    if (this.config.hide.mute) return;
    switch (this.config.replace_mute) {
      case 'play':
      case 'play_pause':
        return html`
          <ha-icon-button
            @click=${e => { this.fireHaptic(); this.player.playPause(e); }}
            .icon=${ICON.PLAY[this.player.isPlaying]}>
            <ha-icon .icon=${ICON.PLAY[this.player.isPlaying]}></ha-icon>
          </ha-icon-button>
        `;
      case 'stop':
        return html`
          <ha-icon-button
            @click=${e => { this.fireHaptic(); this.player.stop(e); }}
            .icon=${ICON.STOP.true}>
            <ha-icon .icon=${ICON.STOP.true}></ha-icon>
          </ha-icon-button>
        `;
      case 'play_stop':
        return html`
          <ha-icon-button
            @click=${e => { this.fireHaptic(); this.player.playStop(e); }}
            .icon=${ICON.STOP[this.player.isPlaying]}>
            <ha-icon .icon=${ICON.STOP[this.player.isPlaying]}></ha-icon>
          </ha-icon-button>
        `;
      case 'next':
        return html`
          <ha-icon-button
            @click=${e => { this.fireHaptic(); this.player.next(e); }}
            .icon=${ICON.NEXT}>
            <ha-icon .icon=${ICON.NEXT}></ha-icon>
          </ha-icon-button>
        `;
      default:
        if (!this.player.supportsMute) return;
        return html`
          <ha-icon-button
            @click=${e => { this.fireHaptic(); this.player.toggleMute(e); }}
            .icon=${ICON.MUTE[muted]}>
            <ha-icon .icon=${ICON.MUTE[muted]}></ha-icon>
          </ha-icon-button>
        `;
    }
  }

  renderPlayButtons() {
    const { hide } = this.config;
    return html`
      ${(!hide.play_pause && this.player.supportsPause) ? this.player.assumedState ? html`
        <ha-icon-button
          @click=${e => { this.fireHaptic(); this.player.play(e); }}
          .icon=${ICON.PLAY.false}>
            <ha-icon .icon=${ICON.PLAY.false}></ha-icon>
        </ha-icon-button>
        <ha-icon-button
          @click=${e => { this.fireHaptic(); this.player.pause(e); }}
          .icon=${ICON.PLAY.true}>
            <ha-icon .icon=${ICON.PLAY.true}></ha-icon>
        </ha-icon-button>
      ` : html`
        <ha-icon-button
          @click=${e => { this.fireHaptic(); this.player.playPause(e); }}
          .icon=${ICON.PLAY[this.player.isPlaying]}>
            <ha-icon .icon=${ICON.PLAY[this.player.isPlaying]}></ha-icon>
        </ha-icon-button>
      ` : html``}
      ${(!hide.play_stop && this.player.supportsStop) ? html`
        <ha-icon-button
          @click=${e => { this.fireHaptic(); this.handleStop(e); }}
          .icon=${hide.play_pause ? ICON.STOP[this.player.isPlaying] : ICON.STOP.true}>
            <ha-icon .icon=${(hide.play_pause || !this.player.supportsPause) ? ICON.STOP[this.player.isPlaying] : ICON.STOP.true}></ha-icon>
        </ha-icon-button>
      ` : html``}
    `;
  }

  renderJumpForwardButton() {
    const hidden = this.config.hide.jump;
    if (hidden || !this.player.hasProgress) return html``;
    return html`
      <ha-icon-button
        @click=${e => { this.fireHaptic(); this.player.jump(e, this.jumpAmount); }}
        .icon=${ICON.FAST_FORWARD}>
        <ha-icon .icon=${ICON.FAST_FORWARD}></ha-icon>
      </ha-icon-button>
    `;
  }

  renderJumpBackwardButton() {
    const hidden = this.config.hide.jump;
    if (hidden || !this.player.hasProgress) return html``;
    return html`
      <ha-icon-button
        @click=${e => { this.fireHaptic(); this.player.jump(e, -this.jumpAmount); }}
        .icon=${ICON.REWIND}>
        <ha-icon .icon=${ICON.REWIND}></ha-icon>
      </ha-icon-button>
    `;
  }

  handleStop(e) {
    return (this.config.hide.play_pause || !this.player.supportsPause) ? this.player.playStop(e) : this.player.stop(e);
  }

  handleVolumeChange(ev) {
    this.fireHaptic('medium');
    const vol = parseFloat(ev.target.value) / 100;
    this.player.setVolume(ev, vol);
  }

  static get styles() {
    return [
      sharedStyle,
      css`
        :host {
          display: flex;
          width: 100%;
          justify-content: space-between;
        }
        .flex {
          display: flex;
          flex: 1;
          justify-content: space-between;
        }
        .vol-slider-wrapper {
          position: relative;
          width: 100%;
          margin: 0 8px;
          display: flex;
          align-items: center;
        }
        .native-vol-slider {
          -webkit-appearance: none;
          appearance: none;
          max-width: none;
          min-width: 100px;
          width: 100%;
          margin: 0;
          background: transparent;
          height: 30px;
          cursor: pointer;
          transform: translateY(calc(var(--mmp-unit) * 0.075));
        }
        .native-vol-slider:focus { outline: none; }
        .native-vol-slider:disabled { cursor: not-allowed; opacity: 0.5; }
        .native-vol-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: linear-gradient(
            to right,
            var(--mmp-accent-color, var(--accent-color)) calc(var(--slider-value, 0) * 1%),
            rgba(var(--rgb-primary-text-color), 0.3) calc(var(--slider-value, 0) * 1%)
          );
        }
        .native-vol-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: var(--mmp-accent-color, var(--accent-color));
          margin-top: -5px; 
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
          transition: transform 0.1s ease;
        }
        .native-vol-slider:not(:disabled)::-webkit-slider-thumb:hover { transform: scale(1.3); }
        .native-vol-slider::-moz-range-track {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: linear-gradient(
            to right,
            var(--mmp-accent-color, var(--accent-color)) calc(var(--slider-value, 0) * 1%),
            rgba(var(--rgb-primary-text-color), 0.3) calc(var(--slider-value, 0) * 1%)
          );
        }
        .native-vol-slider::-moz-range-thumb {
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: var(--mmp-accent-color, var(--accent-color));
          border: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
          transition: transform 0.1s ease;
        }
        .native-vol-slider:not(:disabled)::-moz-range-thumb:hover { transform: scale(1.3); }
        .vol-tooltip-wrapper {
          position: absolute;
          top: -32px;
          left: calc(var(--slider-value, 0) * 1%);
          transform: translateX(calc(-50% + 7px - (var(--slider-value, 0) * 0.14px)));
          
          display: flex;
          justify-content: center;
          align-items: flex-end;
          pointer-events: none;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s ease;
        }
        .native-vol-slider:not(:disabled):active ~ .vol-tooltip-wrapper {
          opacity: 1;
          visibility: visible;
        }
        .vol-tooltip-shape {
          width: 28px;
          height: 28px;
          background-color: var(--mmp-accent-color, var(--accent-color));
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .vol-tooltip-value {
          transform: rotate(45deg);
          color: var(--vol-tooltip-text-color, #e1e1e1);
          font-size: var(--md-slider-label-text-size, var(--md-sys-typescale-label-medium-size, 0.85rem));
          font-weight: var(--md-slider-label-text-weight, var(--md-sys-typescale-label-medium-weight, var(--md-ref-typeface-weight-medium, 500)));
          font-family: var(--ha-font-family-body, Roboto, sans-serif);
          line-height: 1;
        }
        .mmp-media-controls__volume {
          flex: 100;
          max-height: var(--mmp-unit);
          align-items: center;
        }
        .mmp-media-controls__volume.--buttons {
          justify-content: left;
        }
        .mmp-media-controls__media {
          margin-right: 0;
          margin-left: auto;
          justify-content: inherit;
        }
        .mmp-media-controls__media[flow] {
          max-width: none;
          justify-content: space-between;
        }
        .mmp-media-controls__shuffle,
        .mmp-media-controls__repeat {
          flex: 3;
          flex-shrink: 200;
          justify-content: center;
        }
      `,
    ];
  }
}

customElements.define('mmp-media-controls', MiniMediaPlayerMediaControls);
