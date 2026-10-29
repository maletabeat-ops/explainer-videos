import React from 'react';
import {Composition} from 'remotion';
import {ShopVideo} from './Video';
import {Cover} from './Cover';
import ru from '../public/ru/data.json';
import en from '../public/en/data.json';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="ShopRU" component={ShopVideo} width={1080} height={1920} fps={30} durationInFrames={Math.round(ru.dur * 30)} defaultProps={{lang: 'ru' as const, data: ru}} />
		<Composition id="ShopEN" component={ShopVideo} width={1080} height={1920} fps={30} durationInFrames={Math.round(en.dur * 30)} defaultProps={{lang: 'en' as const, data: en}} />
		<Composition id="CoverRU" component={Cover} width={1080} height={1920} fps={30} durationInFrames={1} defaultProps={{lang: 'ru' as const}} />
		<Composition id="CoverEN" component={Cover} width={1080} height={1920} fps={30} durationInFrames={1} defaultProps={{lang: 'en' as const}} />
	</>
);
