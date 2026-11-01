export const STR: Record<'ru' | 'en', any> = {
	ru: {
		handle: '@thewhydept_rus', logo: 'logo_ru_s.png',
		b3: 'CHF 3 МЛРД В ГОД', from: 'А НАЧАЛОСЬ С ЭТОГО', layers: ['ВОЗДУХ', 'ГЕЛЬ', 'ПЕНА'], race: 'ГОНКА ЗА МЯГКОСТЬЮ',
		mushy: 'ПРОВАЛИВАЕТСЯ', weak: 'СЛАБЫЙ ТОЛЧОК',
		ob: 'ОЛИВЬЕ БЕРНАР', obSub: 'швейцарский триатлет', glue: 'КУСОЧКИ ШЛАНГА → ПОД ПОДОШВУ',
		land: 'ПРИЗЕМЛЕНИЕ: СЖИМАЮТСЯ ↓', firm: 'ТОЛЧОК: ТВЁРДО ↑',
		no: 'БОЛЬШИЕ БРЕНДЫ: «НЕТ» (ПО СЛУХАМ)', zurich: 'ЦЮРИХ · 2010', cloud: 'CloudTec®',
		fed: 'РОДЖЕР ФЕДЕРЕР · 2019', ipo: '2021 · БИРЖА НЬЮ-ЙОРКА', b11: '> $11 МЛРД',
		growth: '+30% ЗА ГОД', sales: 'ПРОДАЖИ, CHF МЛРД', fmt: (v: number) => v.toFixed(1).replace('.', ','), whatif: 'А ЧТО, ЕСЛИ?',
		sub: 'ПОДПИСАТЬСЯ', subbed: 'ВЫ ПОДПИСАНЫ ✓', like: 'ЛАЙК',
	},
	en: {
		handle: '@thewhydept_', logo: 'logo_en_s.png',
		b3: 'CHF 3 BILLION A YEAR', from: 'IT STARTED WITH THIS', layers: ['AIR', 'GEL', 'FOAM'], race: 'THE CUSHIONING RACE',
		mushy: 'MUSHY', weak: 'WEAK PUSH-OFF',
		ob: 'OLIVIER BERNHARD', obSub: 'Swiss triathlete', glue: 'HOSE PIECES → UNDER THE SOLE',
		land: 'LANDING: SQUASH ↓', firm: 'PUSH-OFF: FIRM ↑',
		no: 'BIG BRANDS: “NO” (REPORTEDLY)', zurich: 'ZURICH · 2010', cloud: 'CloudTec®',
		fed: 'ROGER FEDERER · 2019', ipo: '2021 · NEW YORK IPO', b11: '> $11 BILLION',
		growth: '+30% IN A YEAR', sales: 'NET SALES, CHF BILLION', fmt: (v: number) => v.toFixed(1), whatif: 'WHAT IF?',
		sub: 'FOLLOW', subbed: 'FOLLOWING ✓', like: 'LIKE',
	},
};
