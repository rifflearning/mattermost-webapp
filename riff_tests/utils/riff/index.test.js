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
