import React from 'react';
import {Composition} from 'remotion';
import {Cover, VTwin, VTwinAudio} from './Main';
import {N} from './timeline';
export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="VTwinEN" component={VTwinAudio} width={1080} height={1920} fps={30} durationInFrames={N} />
		<Composition id="Still" component={VTwin} width={1080} height={1920} fps={30} durationInFrames={N} defaultProps={{}} />
		<Composition id="CoverEN" component={Cover} width={1080} height={1920} fps={30} durationInFrames={1} />
	</>
);
