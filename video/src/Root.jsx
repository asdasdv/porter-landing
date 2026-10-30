import {Composition} from 'remotion';
import {Clip, clipLength} from './Clip.jsx';
import receive from './scenes/receive.js';
import find from './scenes/find.js';
import ship from './scenes/ship.js';

export const FPS = 60;
export const Root = () => (
  <>
    <Composition id="Receive" component={Clip} fps={FPS} width={1920} height={1200}
      durationInFrames={clipLength(receive, FPS)} defaultProps={{scene: receive}} />
    <Composition id="Find" component={Clip} fps={FPS} width={1920} height={1200}
      durationInFrames={clipLength(find, FPS)} defaultProps={{scene: find}} />
    <Composition id="Ship" component={Clip} fps={FPS} width={1920} height={1200}
      durationInFrames={clipLength(ship, FPS)} defaultProps={{scene: ship}} />
  </>
);
