import P5 from "p5";
import { FontsInstance, IEnumerator, MusicTrack, Quote, SFXInstance, SceneCallbacks, Sound } from "../types";
import { BaseScene } from "./BaseScene";
import { MusicPlayer } from "../musicPlayer";
import { getTrackName } from "../utils";

const tracks: MusicTrack[] = [
  MusicTrack.champion,
  MusicTrack.simpleTime,
  MusicTrack.transient,
  MusicTrack.aqueduct,
  MusicTrack.conquerer,
  MusicTrack.lordy,
  MusicTrack.creeplord,
  MusicTrack.dangerZone,
];

export class OSTScene extends BaseScene {
  private sfx: SFXInstance;
  private musicPlayer: MusicPlayer;

  private state = {
    trackIndex: 0,
  }

  constructor(p5: P5, sfx: SFXInstance, musicPlayer: MusicPlayer, fonts: FontsInstance, callbacks: SceneCallbacks = {}) {
    super(p5, fonts, callbacks)
    this.sfx = sfx;
    this.musicPlayer = musicPlayer;
    this.bindActions();
    this.initState();
    this.stopTrack();
    this.playTrack();
  }

  private initState() {
    this.state = {
      trackIndex: 0,
    }
  }

  draw = () => {

    // draw [OST MODE]
    // draw track title
    // draw elapsed time
    // add volume control
    // draw visualization

    this.drawBackground();
    this.drawSceneTitle();
    this.drawTrackMetadata();
    this.drawInstructions();
    this.drawExit();
    this.tick();
  };

  *action(): Generator<IEnumerator, void, unknown> { }

  keyPressed = () => {
    const { keyCode, ESCAPE, LEFT_ARROW, RIGHT_ARROW } = this.props.p5;
    const { onEscapePress } = this.props.callbacks;
    if (keyCode === ESCAPE) {
      if (onEscapePress) {
        this.stopAllCoroutines();
        onEscapePress();
        this.cleanup();
      }
    } else if (keyCode === LEFT_ARROW) {
      this.advanceTrack(-1);
    } else if (keyCode === RIGHT_ARROW) {
      this.advanceTrack(1);
    }
  };

  private stopTrack() {
    return this.musicPlayer.stopAllTracks({ unload: false });
  }

  private playTrack() {
    const sfx = this.sfx;
    sfx.play(Sound.doorOpen, 0.7);
    const track = tracks[this.state.trackIndex];
    this.musicPlayer.play(track);
  }

  private advanceTrack(step: number) {
    this.stopTrack();
    this.state.trackIndex += tracks.length;
    this.state.trackIndex += step;
    this.state.trackIndex %= tracks.length
    this.playTrack();
  }

  private drawSceneTitle = () => {
    const { p5, fonts } = this.props;
    p5.fill('#777');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(12);
    p5.textAlign(p5.RIGHT, p5.TOP);
    p5.text('[OST MODE]', ...this.getPosition(0.98, 0.02));
  }

  private drawExit = () => {
    const { p5, fonts } = this.props;
    p5.fill('#fff');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(12);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text('[ESC] EXIT', ...this.getPosition(0.02, 0.02));
  }

  private drawTrackMetadata = () => {
    const { p5, fonts } = this.props;
    const track = tracks[this.state.trackIndex];
    p5.fill('#fff');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(32);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.fill('#fff');
    p5.text(getTrackName(track), ...this.getPosition(0.5, 0.8));
  }

  private drawInstructions = () => {
    const { p5, fonts } = this.props;
    p5.fill('#fff');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(14);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.fill('#fff');
    p5.text('<- PREV           NEXT ->', ...this.getPosition(0.5, 0.9));
  }
}
