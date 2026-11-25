import React from 'react';
import {Composition, staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import {AbsoluteFill} from 'remotion';
import {PixelLoop} from './Pixel';
import {N} from './timeline';

const WithAudio: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => (
	<AbsoluteFill>
		<PixelLoop lang={lang} />
		<Audio src={staticFile('loop.wav')} />
	</AbsoluteFill>
);
const TT = {ru: {k: 'ВЫ ЗНАЛИ?', a: 'ЧТО КОМАР', b: 'ОСТАВЛЯЕТ', c: 'ВНУТРИ ТЕБЯ'}, en: {k: 'DID YOU KNOW?', a: 'WHAT A', b: 'MOSQUITO LEAVES', c: 'INSIDE YOU'}};
const Cover: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {const t = TT[lang]; const st = (size: number, col: string): React.CSSProperties => ({fontFamily: 'PS2P', fontSize: size, color: col, textShadow: '6px 6px 0 #0c1012, -6px 6px 0 #0c1012, 6px -6px 0 #0c1012, -6px -6px 0 #0c1012', textAlign: 'center', lineHeight: 1.25}); return (
	<AbsoluteFill>
		<PixelLoop lang={lang} at={300} />
		<AbsoluteFill style={{top: 1180, height: 520, background: 'rgba(12,16,18,.93)', borderTop: '12px solid #ffe14d', borderBottom: '12px solid #ffe14d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26}}>
			<div style={{...st(42, '#0c1012'), textShadow: 'none', background: '#ffe14d', padding: '16px 26px'}}>{t.k}</div>
			<div style={st(lang === 'ru' ? 70 : 64, '#f4f1e8')}>{t.a}<br />{t.b}</div>
			<div style={st(lang === 'ru' ? 76 : 80, '#ff5a5a')}>{t.c}</div>
		</AbsoluteFill>
	</AbsoluteFill>
);};
export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="MosqRU" component={WithAudio} width={1080} height={1920} fps={30} durationInFrames={N} defaultProps={{lang: 'ru' as const}} />
		<Composition id="MosqEN" component={WithAudio} width={1080} height={1920} fps={30} durationInFrames={N} defaultProps={{lang: 'en' as const}} />
		<Composition id="CoverRU" component={Cover} width={1080} height={1920} fps={30} durationInFrames={1} defaultProps={{lang: 'ru' as const}} />
		<Composition id="CoverEN" component={Cover} width={1080} height={1920} fps={30} durationInFrames={1} defaultProps={{lang: 'en' as const}} />
	</>
);
