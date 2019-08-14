// Copyright (c) 2019-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import assert from 'assert';

import {readablePeers} from 'utils/riff';

// Proof of concept test - still needs to be fleshed out
describe('Riff Utils', () => {
    describe('readablePeers', () => {
        it('handles empty array', () => {
            assert.equal(
                readablePeers([]),
                'Nobody else is here.',
            );
        });
    });
});
