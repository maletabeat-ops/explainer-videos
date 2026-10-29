import React, {useMemo} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {createTikTokStyleCaptions, type Caption, type TikTokPage} from '@remotion/captions';
import {C, DISPLAY, FPS} from './ui';

const SWITCH_MS = 1000;
const Page: React.FC<{page: TikTokPage}> = ({page}) => {
	const frame = useCurrentFrame();
	const ms = page.startMs + (frame / FPS) * 1000;
	const appear = Math.min(1, frame / 4);
	return (
		<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', top: 1600}}>
			<div style={{maxWidth: 980, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 68, lineHeight: 1.12, whiteSpace: 'pre-wrap', transform: `scale(${0.9 + 0.1 * appear})`, opacity: appear,
				textShadow: '0 4px 0 #000, 0 0 18px rgba(0,0,0,.9)', WebkitTextStroke: '10px #0b0f22', paintOrder: 'stroke fill'}}>
				{page.tokens.map((tk, i) => {
					const on = ms >= tk.fromMs && ms < tk.toMs + 120;
					return <span key={i} style={{color: on ? C.gold : '#ffffff', display: 'inline-block', margin: '0 0.14em', transform: on ? 'scale(1.08)' : undefined}}>{tk.text.trim()}</span>;
				})}
			</div>
		</AbsoluteFill>
	);
};
export const Captions: React.FC<{captions: Caption[]}> = ({captions}) => {
	const {pages} = useMemo(() => createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: SWITCH_MS}), [captions]);
	return (
		<AbsoluteFill>
			{pages.map((page, i) => {
				const next = pages[i + 1] ?? null;
				const from = Math.round((page.startMs / 1000) * FPS);
				const end = Math.round(Math.min(next ? (next.startMs / 1000) * FPS : Infinity, (page.startMs + page.durationMs + 400) / 1000 * FPS));
				if (end - from <= 0) return null;
				return <Sequence key={i} from={from} durationInFrames={end - from} layout="none"><Page page={page} /></Sequence>;
			})}
		</AbsoluteFill>
	);
};
