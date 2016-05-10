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

function trimmed(str: TemplateStringsArray): string {
    return str[0].replace(/\n\s+/g, ' \n ').replace(/^\s*\n|\n\s*$/g, '');
}

describe('GameMap', () => {
    it('should stringify correctly', () => {
        let map = new GameMap();
        map.discover([[{type: 'grass'}]]);
        expect(map.toString()).to.equal('(g)');

        map.discover([
            [{type: 'grass'}, {type: 'forest'}, {type: 'mountain'}],
            [{type: 'water'}, {type: 'grass'}, {type: 'grass'}],
            [{type: 'mountain'}, {type: 'grass'}, {type: 'grass'}]
        ]);

        expect(map.toString()).to.equal(trimmed `
            g  f  m
            w (g) g
            m  g  g
        `);
    });

    it('should discover correctly', () => {
        let map = new GameMap();
        map.discover([
            [{type: 'grass'}, {type: 'forest'}, {type: 'mountain'}],
            [{type: 'water'}, {type: 'grass'}, {type: 'grass'}],
            [{type: 'mountain'}, {type: 'grass'}, {type: 'grass'}]
        ]);

        expect(map.toString()).to.equal(trimmed `
            g  f  m
            w (g) g
            m  g  g
        `);

        map.playerMoved('up');
        map.discover([
            [{type: 'mountain'}, {type: 'water'}, {type: 'water'}],
            [{type: 'grass'}, {type: 'forest'}, {type: 'mountain'}],
            [{type: 'water'}, {type: 'grass'}, {type: 'grass'}]
        ]);

        expect(map.toString()).to.equal(trimmed `
            m  w  w
            g (f) m
            w  g  g
            m  g  g
        `);
    });
});
