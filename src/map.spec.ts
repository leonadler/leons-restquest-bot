import { IMapTile, MapTile, GameMap } from './map';
import { expect } from './tests-base';

describe('MapTile', () => {
    it('should keep the values passed to it', () => {
        let tile: MapTile = new MapTile({
            type: 'mountain',
            castle: 'botname',
            treasure: false
        });

        expect(tile).to.have.property('type')
            .that.equals('mountain');
        expect(tile).to.have.property('castle')
            .that.equals('botname');
        expect(tile).to.have.property('treasure')
            .that.equals(false);
    });
});
