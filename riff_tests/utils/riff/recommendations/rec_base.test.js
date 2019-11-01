// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {RecommendationBase, _test} from 'utils/riff/recommendations/rec_base';

describe.only('RecommendationBase Class', () => {
    // mock derived Class w/ static properties needed by base class and others defined
    // (not even a real class, but all that's needed for these tests)
    const derivedClass = {
        recType:            'foo type',
        description:        'describe this I tell you',
        startWeek:          100,
        numWeeksToDisplay:  24,
        priority:           10,
        displayText:        'gotta display something',
        someOtherProp:      {a: 'random', type: true},
    };

    describe('baseConfig static method', () => {
        it('should copy the expected static properties to the returned config object', () => {
            const config = RecommendationBase.baseConfig(derivedClass);

            expect(config).toHaveProperty('recType', derivedClass.recType);
            expect(config).toHaveProperty('description', derivedClass.description);
            expect(config).toHaveProperty('startWeek', derivedClass.startWeek);
            expect(config).toHaveProperty('numWeeksToDisplay', derivedClass.numWeeksToDisplay);
            expect(config).toHaveProperty('priority', derivedClass.priority);
            expect(config).toHaveProperty('displayText', derivedClass.displayText);
        });

        it('should not copy other properties to the returned config object', () => {
            const config = RecommendationBase.baseConfig(derivedClass);

            expect(config).not.toHaveProperty('someOtherProp');
        });

        it.skip('should log a warning about missing properties', () => {
            expect('Not tested').toBe('tested');
        });

        it.skip('should log an error about properties that are the wrong type', () => {
            expect('Not tested').toBe('tested');
        });
    });

    describe('constructor', () => {
        it('should copy properties from config to instance properties', () => {
            const config = RecommendationBase.baseConfig(derivedClass);
            const baseRec = new RecommendationBase(config);

            expect(baseRec).toHaveProperty('recType', config.recType);
            expect(baseRec).toHaveProperty('description', config.description);
            expect(baseRec).toHaveProperty('startWeek', config.startWeek);
            expect(baseRec).toHaveProperty('numWeeksToDisplay', config.numWeeksToDisplay);
            expect(baseRec).toHaveProperty('priority', config.priority);
            expect(baseRec).toHaveProperty('displayText', config.displayText);
        });
    });

    describe('shouldDisplay method', () => {
        const config = RecommendationBase.baseConfig(derivedClass);
        config.startWeek = 3;
        config.numWeeksToDisplay = 2;
        const baseRec = new RecommendationBase(config);
        const courseStart = new Date(2019, 8, 1, 12, 30);
        const testTimeWeek2 = new Date(2019, 8, 1 + 7 + 1);
        const testTimeWeek3 = new Date(2019, 8, 1 + 14 + 1);
        const testTimeWeek4 = new Date(2019, 8, 1 + 21 + 1);
        const testTimeWeek5 = new Date(2019, 8, 1 + 28 + 1);

        it('should return true for a time that is in the recommendation\'s period to be displayed', () => {
            expect(baseRec.shouldDisplay(courseStart, testTimeWeek3)).toBe(true);
            expect(baseRec.shouldDisplay(courseStart, testTimeWeek4)).toBe(true);
        });

        it('should return false for a time that is outside the recommendation\'s period to be displayed', () => {
            expect(baseRec.shouldDisplay(courseStart, testTimeWeek2)).toBe(false);
            expect(baseRec.shouldDisplay(courseStart, testTimeWeek5)).toBe(false);
        });
    });

    describe('displayPriority method', () => {
        const config = RecommendationBase.baseConfig(derivedClass);
        const baseRec = new RecommendationBase(config);

        // displayPriority is calculated as (startWeek * max_display_num) + priority
        it('should correctly calculate the display priority with valid start weeks and priorities', () => {
            baseRec.startWeek = 1;
            baseRec.priority = 2;
            _test.MAX_REC_DISPLAY_NUMBER = 5;
            expect(baseRec.displayPriority()).toBe(7);

            baseRec.startWeek = 5;
            expect(baseRec.displayPriority()).toBe(27);

            baseRec.priority = 0;
            expect(baseRec.displayPriority()).toBe(25);

            _test.MAX_REC_DISPLAY_NUMBER = 3;
            expect(baseRec.displayPriority()).toBe(15);
        });
    });
});
