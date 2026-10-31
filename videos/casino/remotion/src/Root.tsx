import React from 'react';
import {Composition} from 'remotion';
import {CasinoShort} from './Short';
import {CasinoLong} from './Long';
import {CoverShort, Thumb} from './Cover';
import ru from '../public/ru/data.json';
import en from '../public/en/data.json';
import long from '../public/long/data.json';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="CasinoRU" component={CasinoShort} width={1080} height={1920} fps={30} durationInFrames={Math.round(ru.dur * 30)} defaultProps={{lang: 'ru' as const, data: ru}} />
		<Composition id="CasinoEN" component={CasinoShort} width={1080} height={1920} fps={30} durationInFrames={Math.round(en.dur * 30)} defaultProps={{lang: 'en' as const, data: en}} />
		<Composition id="CasinoLong" component={CasinoLong} width={1920} height={1080} fps={30} durationInFrames={Math.round(long.dur * 30)} defaultProps={{data: long}} />
		<Composition id="CoverRU" component={CoverShort} width={1080} height={1920} fps={30} durationInFrames={1} defaultProps={{lang: 'ru' as const}} />
		<Composition id="CoverEN" component={CoverShort} width={1080} height={1920} fps={30} durationInFrames={1} defaultProps={{lang: 'en' as const}} />
		<Composition id="Thumb" component={Thumb} width={1280} height={720} fps={30} durationInFrames={1} />
	</>
);
