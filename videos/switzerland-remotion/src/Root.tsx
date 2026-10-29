import React from 'react';
import {Composition, staticFile} from 'remotion';
import {SwissVideo} from './Video';
import ru from '../public/ru/data.json';
import en from '../public/en/data.json';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="SwissRU" component={SwissVideo} width={1080} height={1920} fps={30} durationInFrames={Math.round(ru.dur * 30)} defaultProps={{lang: 'ru' as const, data: ru}} />
		<Composition id="SwissEN" component={SwissVideo} width={1080} height={1920} fps={30} durationInFrames={Math.round(en.dur * 30)} defaultProps={{lang: 'en' as const, data: en}} />
	</>
);
