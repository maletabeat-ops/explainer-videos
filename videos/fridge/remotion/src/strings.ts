export const STR: Record<'ru' | 'en', any> = {
	ru: {
		head: 'КАК РАБОТАЕТ ХОЛОДИЛЬНИК', t1: 'КАК РАБОТАЕТ', t2: 'ХОЛОДИЛЬНИК?',
		nocold: 'ХОЛОД НЕ ДЕЛАЕТ', out: 'ТЕПЛО ЕДЫ → НА КУХНЮ', back: 'СЗАДИ ТЕПЛО', touch: 'ЭТО ТЕПЛО ТВОИХ ПРОДУКТОВ',
		agent: 'ХЛАДАГЕНТ', iso: 'ИЗОБУТАН · R600a', boil: 'КИПИТ ПРИ −12 °C',
		evap: 'ИСПАРЕНИЕ', sweat: 'КАК ПОТ НА КОЖЕ', fridgeT: '+4 °C', freezerT: '−18 °C',
		comp: 'КОМПРЕССОР', hot: 'ГОРЯЧИЙ ПАР', grid: 'КОНДЕНСАТОР', toRoom: 'ТЕПЛО → В КОМНАТУ',
		tube: 'КАПИЛЛЯР', drop: 'ДАВЛЕНИЕ ↓  ХОЛОД ↓', loop: 'КРУГ ЗАМКНУЛСЯ',
		stages: ['ИСПАРЕНИЕ', 'СЖАТИЕ', 'КОНДЕНСАЦИЯ', 'РАСШИРЕНИЕ'],
		hist: [['1900-е', 'АММИАК И СЕРНИСТЫЙ ГАЗ', 'ЯДОВИТЫЕ УТЕЧКИ'], ['1930-е', 'ФРЕОН', 'БЕЗОПАСЕН... НО'], ['1987', 'ЗАПРЕТ ФРЕОНОВ', 'ОЗОНОВЫЙ СЛОЙ'], ['СЕГОДНЯ', 'ИЗОБУТАН', 'БЕЗ ВРЕДА ДЛЯ ОЗОНА']],
		door: 'ДВЕРЦА ОТКРЫТА', kitchen: 'КУХНЯ', warmer: 'ТЕПЛЕЕ, А НЕ ХОЛОДНЕЕ', fin1: 'ХОЛОДИЛЬНИК —', sub: 'ПОДПИСАТЬСЯ', subbed: 'ВЫ ПОДПИСАНЫ ✓', like: 'ЛАЙК', fin2: 'НАСОС ДЛЯ ТЕПЛА', end: 'ТЕПЕРЬ ТЫ ЗНАЕШЬ!',
	},
	en: {
		head: 'HOW A FRIDGE WORKS', t1: 'HOW DOES A', t2: 'FRIDGE WORK?',
		nocold: "IT DOESN'T MAKE COLD", out: 'FOOD HEAT → YOUR KITCHEN', back: 'THE BACK IS WARM', touch: "THAT'S YOUR GROCERIES' HEAT",
		agent: 'REFRIGERANT', iso: 'ISOBUTANE · R600a', boil: 'BOILS AT 11 °F',
		evap: 'EVAPORATION', sweat: 'LIKE SWEAT ON SKIN', fridgeT: '40 °F', freezerT: '0 °F',
		comp: 'COMPRESSOR', hot: 'HOT VAPOR', grid: 'CONDENSER COILS', toRoom: 'HEAT → INTO THE ROOM',
		tube: 'CAPILLARY TUBE', drop: 'PRESSURE ↓  COLD ↓', loop: 'THE LOOP RESTARTS',
		stages: ['EVAPORATE', 'COMPRESS', 'CONDENSE', 'EXPAND'],
		hist: [['1900s', 'AMMONIA & SULFUR DIOXIDE', 'TOXIC LEAKS'], ['1930s', 'FREON', 'SAFE... BUT'], ['1987', 'FREON BAN', 'OZONE LAYER'], ['TODAY', 'ISOBUTANE', 'OZONE-FRIENDLY']],
		door: 'DOOR LEFT OPEN', kitchen: 'KITCHEN', warmer: 'WARMER, NOT COOLER', fin1: 'A FRIDGE IS', sub: 'FOLLOW', subbed: 'FOLLOWING ✓', like: 'LIKE', fin2: 'A HEAT PUMP', end: 'NOW YOU KNOW!',
	},
};
