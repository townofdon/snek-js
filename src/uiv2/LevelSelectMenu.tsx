import React, { useEffect, useState } from "react"
import { useForceRerender } from "./hooks/useForceRerender";
import { InputAction } from "@/types";
import { onUIEvent, unsubscribeOnUIEvent } from "@/ui/uiEvents";

export const LevelSelectMenu = () => {
  const [showing, setShowing] = useState(false);
  const forceRerender = useForceRerender();

  useEffect(() => {
    const handleUIEvent = (action: InputAction = InputAction.None) => {
      switch (action) {
        case InputAction.ForceRerender:
          forceRerender();
          break;
        case InputAction.ShowLevelSelectMenu:
          setShowing(true);
          break;
        case InputAction.HideLevelSelectMenu:
          setShowing(false);
          break;
        case InputAction.ShowSettingsMenu:
          setShowing(false);
          break;
        case InputAction.ShowMainMenu:
          setShowing(false);
          break;
        case InputAction.ShowGameModeMenu:
          setShowing(false);
          break;
        default:
          break;
      }
    }
    onUIEvent(handleUIEvent);
    return () => {
      unsubscribeOnUIEvent(handleUIEvent);
    }
  }, []);

  // handleUIInteract
  // return levelSelectMenuNavMap.callSelected();

  // handleUICancel
  // this.callAction(InputAction.HideLevelSelectMenu);

  // useEffect(() => {
  //   if (showing && elements[SettingsMenuElement.CheckboxDisableScreenshake].current) {
  //     const settingsMenuElements: Record<SettingsMenuElement, HTMLInputElement | HTMLButtonElement> = {
  //       [SettingsMenuElement.CheckboxCasualMode]: elements[SettingsMenuElement.CheckboxCasualMode].current,
  //       [SettingsMenuElement.CheckboxCobraMode]: elements[SettingsMenuElement.CheckboxCobraMode].current,
  //       [SettingsMenuElement.CheckboxDisableScreenshake]: elements[SettingsMenuElement.CheckboxDisableScreenshake].current,
  //       [SettingsMenuElement.SliderMusicVolume]: elements[SettingsMenuElement.SliderMusicVolume].current,
  //       [SettingsMenuElement.SliderSfxVolume]: elements[SettingsMenuElement.SliderSfxVolume].current,
  //       [SettingsMenuElement.ButtonClose]: elements[SettingsMenuElement.ButtonClose].current,
  //     }
  //     settingsMenuNavMap.current = new SettingsMenuNavMap(settingsMenuElements, bridge.callAction);
  //     bridge.settingsMenu.onNavigate = (navDir: UINavDir) => {
  //       const moveSlider = (focused: SettingsMenuElement | null, direction: number): boolean => {
  //         if (focused === SettingsMenuElement.SliderMusicVolume) {
  //           const elem = settingsMenuElements[SettingsMenuElement.SliderMusicVolume] as HTMLInputElement;
  //           const volume = Math.max((parseFloat(elem.value) || 0) + (direction * 0.1), 0);
  //           bridge.settings.musicVolume = volume;
  //           setMusicVolume(volume);
  //           forceRerender();
  //           return true;
  //         } else if (focused === SettingsMenuElement.SliderSfxVolume) {
  //           const elem = settingsMenuElements[SettingsMenuElement.SliderSfxVolume] as HTMLInputElement;
  //           const volume = Math.max((parseFloat(elem.value) || 0) + (direction * 0.1), 0);
  //           bridge.settings.sfxVolume = volume;
  //           setSfxVolume(volume);
  //           bridge.callAction(InputAction.TestAudio);
  //           forceRerender();
  //           return true;
  //         }
  //         return false;
  //       }
  //       switch (navDir) {
  //         case UINavDir.Prev:
  //         case UINavDir.Up:
  //           settingsMenuNavMap.current.gotoPrev();
  //           break;
  //         case UINavDir.Next:
  //         case UINavDir.Down:
  //           settingsMenuNavMap.current.gotoNext();
  //           break;
  //         case UINavDir.Left:
  //           if (gamepadPressed(getGamepad(), Button.DpadLeft)) {
  //             const focused = settingsMenuNavMap.current.getFocused();
  //             const handled = moveSlider(focused, -1);
  //             if (handled) forceRerender();
  //             return handled;
  //           }
  //           // do not handle event so that slider can receive left/right DOM event
  //           return false;
  //         case UINavDir.Right:
  //           if (gamepadPressed(getGamepad(), Button.DpadRight)) {
  //             const focused = settingsMenuNavMap.current.getFocused();
  //             const handled = moveSlider(focused, 1);
  //             if (handled) forceRerender();
  //             return handled;
  //           }
  //           // do not handle event so that slider can receive left/right DOM event
  //           return false;
  //       }
  //       return true;
  //     };
  //     bridge.settingsMenu.onInteract = () => {
  //       const handled = settingsMenuNavMap.current.callSelected()
  //       if (handled) forceRerender();
  //       return handled;
  //     };
  //     bridge.settingsMenu.onCancel = () => {
  //       bridge.callAction(InputAction.HideSettingsMenu);
  //       return true;
  //     };
  //   } else {
  //     bridge.settingsMenu.onNavigate = null;
  //     bridge.settingsMenu.onInteract = null;
  //     bridge.settingsMenu.onCancel = null;
  //     settingsMenuNavMap.current = null;
  //   }
  // }, [showing]);

  if (!showing) return null;

  return null;

  return (
    <div id="level-select-menu" className="settings-menu level-select-menu hidden">
      <div className="background blur"></div>
      <div className="content">
        <h2 className="center">Level Select</h2>
        <h3 id="level-select-challenge-heading" className="center challenge-heading hidden">Challenge</h3>
        <h3 className="center level-name">
          <span className="transform-flip-x"><img src="assets/graphics/editor-play.png" width="16" height="16" /></span>
          <span id="level-select-map-number" className="num">01</span>
          <span id="level-select-map-name" className="name">Snekadia</span>
          <span><img src="assets/graphics/editor-play.png" width="16" height="16" /></span>
        </h3>
        <div id="level-select-levels" className="levels">
          <button id="select-level-snekadia" className="select-level" data-level="1">
            <div className="completion-status">
              <div className="medium"></div>
              <div className="hard"></div>
              <div className="ultra"></div>
            </div>
            <img alt="Select level snekadia" src="assets/graphics/level-preview/snekadia.jpg" width="150" height="150" />
          </button>
          <button id="select-level-plaza" className="select-level" data-level="2">
            <img alt="Select level plaza" src="assets/graphics/level-preview/plaza.jpg" width="150" height="150" />
          </button>
          <button id="select-level-metro" className="select-level" data-level="3">
            <img alt="Select level metro" src="assets/graphics/level-preview/metro.jpg" width="150" height="150" />
          </button>
          <button id="select-level-turnaround" className="select-level" data-level="110">
            <img alt="Select level turnaround" src="assets/graphics/level-preview/turnaround.jpg" width="150" height="150" />
          </button>
          <button id="select-level-facility" className="select-level" data-level="4">
            <img alt="Select level facility" src="assets/graphics/level-preview/facility.jpg" width="150" height="150" />
          </button>
          <button id="select-level-panopticon" className="select-level" data-level="5">
            <img alt="Select level panopticon" src="assets/graphics/level-preview/panopticon.jpg" width="150" height="150" />
          </button>
          <button id="select-level-lobby" className="select-level" data-level="6">
            <img alt="Select level lobby" src="assets/graphics/level-preview/lobby.jpg" width="150" height="150" />
          </button>
          <button id="select-level-factory-floor" className="select-level" data-level="7">
            <img alt="Select level factory-floor" src="assets/graphics/level-preview/factory-floor.jpg" width="150" height="150" />
          </button>
          <button id="select-level-courtyard" className="select-level" data-level="8">
            <img alt="Select level courtyard" src="assets/graphics/level-preview/courtyard.jpg" width="150" height="150" />
          </button>
          <button id="select-level-labyrinth" className="select-level" data-level="9">
            <img alt="Select level labyrinth" src="assets/graphics/level-preview/labyrinth.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-factor" className="select-level" data-level="10">
            <img alt="Select level x-factor" src="assets/graphics/level-preview/x-factor.jpg" width="150" height="150" />
          </button>
          <button id="select-level-turnonadime" className="select-level" data-level="120">
            <img alt="Select level turnonadime" src="assets/graphics/level-preview/turnonadime.jpg" width="150" height="150" />
          </button>
          <button id="select-level-sneksqueeze" className="select-level" data-level="11">
            <img alt="Select level sneksqueeze" src="assets/graphics/level-preview/sneksqueeze.jpg" width="150" height="150" />
          </button>
          <button id="select-level-boxed" className="select-level" data-level="12">
            <img alt="Select level boxed" src="assets/graphics/level-preview/boxed.jpg" width="150" height="150" />
          </button>
          <button id="select-level-portal" className="select-level" data-level="130">
            <img alt="Select level portal" src="assets/graphics/level-preview/portal.jpg" width="150" height="150" />
          </button>
          <button id="select-level-sci-lab" className="select-level" data-level="13">
            <img alt="Select level sci-lab" src="assets/graphics/level-preview/sci-lab.jpg" width="150" height="150" />
          </button>
          <button id="select-level-test-chamber" className="select-level" data-level="14">
            <img alt="Select level test-chamber" src="assets/graphics/level-preview/test-chamber.jpg" width="150" height="150" />
          </button>
          <button id="select-level-quantum-mirror" className="select-level" data-level="15">
            <img alt="Select level quantum-mirror" src="assets/graphics/level-preview/quantum-mirror.jpg" width="150" height="150" />
          </button>
          <button id="select-level-gatekeeper" className="select-level" data-level="140">
            <img alt="Select level gatekeeper" src="assets/graphics/level-preview/gatekeeper.jpg" width="150" height="150" />
          </button>
          <button id="select-level-bait-switch" className="select-level" data-level="16">
            <img alt="Select level bait-&-switch" src="assets/graphics/level-preview/bait-switch.jpg" width="150" height="150" />
          </button>
          <button id="select-level-ruins" className="select-level" data-level="17">
            <img alt="Select level ruins" src="assets/graphics/level-preview/ruins.jpg" width="150" height="150" />
          </button>
          <button id="select-level-computer-room" className="select-level" data-level="18">
            <img alt="Select level computer-room" src="assets/graphics/level-preview/computer-room.jpg" width="150" height="150" />
          </button>
          <button id="select-level-escada" className="select-level" data-level="19">
            <img alt="Select level escada" src="assets/graphics/level-preview/escada.jpg" width="150" height="150" />
          </button>
          <button id="select-level-survive" className="select-level" data-level="99">
            <img alt="Select level survive" src="assets/graphics/level-preview/survive.jpg" width="150" height="150" />
          </button>


          <button id="select-level-metroteque" className="select-level" data-level="203">
            <img alt="Select level metroteque" src="assets/graphics/level-preview/metroteque.jpg" width="150" height="150" />
          </button>
          <button id="select-level-the-diamond" className="select-level" data-level="205">
            <img alt="Select level the-diamond" src="assets/graphics/level-preview/the-diamond.jpg" width="150" height="150" />
          </button>
          <button id="select-level-factory-subfloor" className="select-level" data-level="207">
            <img alt="Select level factory-subfloor" src="assets/graphics/level-preview/factory-subfloor.jpg" width="150" height="150" />
          </button>
          <button id="select-level-boneyard" className="select-level" data-level="208">
            <img alt="Select level boneyard" src="assets/graphics/level-preview/boneyard.jpg" width="150" height="150" />
          </button>
          <button id="select-level-security-station" className="select-level" data-level="210">
            <img alt="Select level security-station" src="assets/graphics/level-preview/security-station.jpg" width="150" height="150" />
          </button>
          <button id="select-level-phased-reality" className="select-level" data-level="215">
            <img alt="Select level phased-reality" src="assets/graphics/level-preview/phased-reality.jpg" width="150" height="150" />
          </button>
          <button id="select-level-endurance" className="select-level" data-level="299">
            <img alt="Select level endurance" src="assets/graphics/level-preview/endurance.jpg" width="150" height="150" />
          </button>

          <button id="select-level-secret-area-1-1" className="select-level" data-level="310">
            <img alt="Select level secret-area-1-1" src="assets/graphics/level-preview/secret-area-1-1.jpg" width="150" height="150" />
          </button>
          <button id="select-level-secret-area-5-1" className="select-level" data-level="321">
            <img alt="Select level secret-area-5-1" src="assets/graphics/level-preview/secret-area-5-1.jpg" width="150" height="150" />
          </button>
          <button id="select-level-secret-area-5-2" className="select-level" data-level="320">
            <img alt="Select level secret-area-5-2" src="assets/graphics/level-preview/secret-area-5-2.jpg" width="150" height="150" />
          </button>

          <button id="select-level-x-snekcity" className="select-level" data-level="417">
            <img alt="Select level x-snekcity" src="assets/graphics/level-preview/snekcity.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-acropolis" className="select-level" data-level="401">
            <img alt="Select level x-acropolis" src="assets/graphics/level-preview/acropolis.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-beacons" className="select-level" data-level="402">
            <img alt="Select level x-beacons" src="assets/graphics/level-preview/beacons.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-cubism" className="select-level" data-level="418">
            <img alt="Select level x-cubism" src="assets/graphics/level-preview/cubism.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-casa" className="select-level" data-level="403">
            <img alt="Select level x-casa" src="assets/graphics/level-preview/casa.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-digin" className="select-level" data-level="419">
            <img alt="Select level x-digin" src="assets/graphics/level-preview/digin.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-catacombs" className="select-level" data-level="404">
            <img alt="Select level x-catacombs" src="assets/graphics/level-preview/catacombs.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-fortitude" className="select-level" data-level="405">
            <img alt="Select level x-fortitude" src="assets/graphics/level-preview/fortitude.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-guardian" className="select-level" data-level="406">
            <img alt="Select level x-guardian" src="assets/graphics/level-preview/guardian.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-kings-hall" className="select-level" data-level="407">
            <img alt="Select level x-kings-hall" src="assets/graphics/level-preview/kings-hall.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-last-rites" className="select-level" data-level="409">
            <img alt="Select level x-last-rites" src="assets/graphics/level-preview/last-rites.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-makeitoutalive" className="select-level" data-level="410">
            <img alt="Select level x-makeitoutalive" src="assets/graphics/level-preview/makeitoutalive.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-quantum-entanglement" className="select-level" data-level="411">
            <img alt="Select level x-quantum-entanglement" src="assets/graphics/level-preview/quantum-entanglement.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-skillcheck" className="select-level" data-level="412">
            <img alt="Select level x-skillcheck" src="assets/graphics/level-preview/skillcheck.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-stonemaze" className="select-level" data-level="408">
            <img alt="Select level x-stonemaze" src="assets/graphics/level-preview/stonemaze.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-toosimple" className="select-level" data-level="413">
            <img alt="Select level x-toosimple" src="assets/graphics/level-preview/toosimple.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-datacenter" className="select-level" data-level="420">
            <img alt="Select level x-datacenter" src="assets/graphics/level-preview/datacenter.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-underground" className="select-level" data-level="414">
            <img alt="Select level x-underground" src="assets/graphics/level-preview/underground.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-unwind" className="select-level" data-level="415">
            <img alt="Select level x-unwind" src="assets/graphics/level-preview/unwind.jpg" width="150" height="150" />
          </button>
          <button id="select-level-x-gauntlet" className="select-level" data-level="416">
            <img alt="Select level x-gauntlet" src="assets/graphics/level-preview/gauntlet.jpg" width="150" height="150" />
          </button>
        </div>
        <button id="button-level-select-back" className="button back">&lt;- back</button>
      </div>
    </div>
  )
}
