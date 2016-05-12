import { IMapTile, MapTile, GameMap, Direction } from './map';
import { expect } from './tests-base';

describe('MapTile', () => {
    it('should keep the values passed to it', () => {
        let tile: MapTile = new MapTile(1, 5, {
            type: 'mountain',
            castle: 'botname',
            treasure: false
        });

        expect(tile).to.have.property('x')
            .that.equals(1);
        expect(tile).to.have.property('y')
            .that.equals(5);
        expect(tile).to.have.property('type')
            .that.equals('mountain');
        expect(tile).to.have.property('castle')
            .that.equals('botname');
        expect(tile).to.have.property('treasure')
            .that.equals(false);
    });
});

function toMap(str: TemplateStringsArray): GameMap {
    let map = new GameMap();
    map.discover(mapTiles(str));
    return map;
}

function mapTiles(str: TemplateStringsArray): MapTile[][] {
    let lines = str.join('').trim().split(/[\r\n]+/).map(line => line.trim().split(/\s+/));
    return <MapTile[][]> lines.map(line => line.map(tileType => ({ type: tileType })));
}

function trimmed(str: TemplateStringsArray): string {
    return str[0].replace(/\n\s+/g, ' \n ').replace(/^\s*\n|\n\s*$/g, '');
}

describe('GameMap', () => {
    it('toString() works', () => {
        let map = toMap `grass`;
        expect(map.toString()).to.equal('(g)');

        map = toMap `
            grass    forest  mountain
            water    grass   grass
            mountain grass   grass
        `;

        expect(map.toString()).to.equal(trimmed `
            g  f  m
            w (g) g
            m  g  g
        `);
    });

    it('discover() works', () => {
        let map = new GameMap();
        map.discover(mapTiles `
            grass     forest  mountain
            water     grass   grass
            mountain  grass   grass
        `);
        expect(map.toString()).to.equal(trimmed `
            g  f  m
            w (g) g
            m  g  g
        `);

        map.playerMoved('up');
        map.discover(mapTiles `
            mountain  water   water
            grass     forest  mountain
            water     grass   grass
        `);

        expect(map.toString()).to.equal(trimmed `
            m  w  w
            g (f) m
            w  g  g
            m  g  g
        `);

        map.playerMoved('right');
        map.discover(mapTiles `
            water   water     grass
            forest  mountain  water
            grass   grass     water
        `);

        expect(map.toString()).to.equal(trimmed `
            m  w  w  g
            g  f (m) w
            w  g  g  w
            m  g  g  ?
        `);
    });

    it('hasSeen() works', () => {
        let map = toMap `
            grass     forest  mountain
            water     grass   grass
            mountain  grass   grass
        `;

        expect(map.hasSeen(0, 0)).to.equal(true);
        expect(map.hasSeen(1, 1)).to.equal(true);
        expect(map.hasSeen(3, 1)).to.equal(false);
        expect(map.hasSeen(0, -3)).to.equal(false);
        expect(map.hasSeen(2, 2)).to.equal(false);
    });

    describe('shortestPathBetweenPoints()', () => {
        function pathToString(path: Direction[]): string {
            return path.map(part => part.charAt(0)).join('');
        }

        it('works for small maps', () => {
            let map = toMap `
                grass     forest  mountain
                water     grass   grass
                mountain  grass   grass
            `;

            expect(map.getTileAt(-1, -1).type).to.equal('mountain');
            expect(map.getTileAt(0, -1).type).to.equal('grass');

            let path = map.shortestPathBetweenPoints(0, 0, 0, 1);
            expect(pathToString(path)).to.equal('u');

            path = map.shortestPathBetweenPoints(0, -1, 0, 1);
            expect(pathToString(path)).to.equal('uu');

            path = map.shortestPathBetweenPoints(0, -1, 0, 2); // invalid y
            expect(path).to.equal(null);

            path = map.shortestPathBetweenPoints(-1, -1, 1, -1);
            expect(pathToString(path)).to.equal('rr');
        });

        it('works for large maps', () => {
            let map = toMap `
                grass     water   water   water   grass
                grass     water   water   water   grass
                grass     forest  water   water   grass
                grass     water   grass   grass   grass
                mountain  grass   grass   grass   grass
            `;

            expect(map.getTileAt(-2, 2).type).to.equal('grass');
            expect(map.getTileAt(-1, 2).type).to.equal('water');

            let path = map.shortestPathBetweenPoints(-2, 2, 2, 2);
            expect(pathToString(path)).to.equal('dddddrrurruuu');

            path = map.shortestPathBetweenPoints(-1, 0, 2, 2);
            expect(pathToString(path)).to.equal('ldddrrurruuu');
        });


        it('does not walk into water', () => {
            let map = toMap `
                grass     water   grass   grass   grass
                grass     water   grass   water   grass
                grass     water   grass   water   grass
                grass     water   grass   water   grass
                mountain  grass   grass   water   grass
            `;

            expect(map.getTileAt(-2, 2).type).to.equal('grass');
            expect(map.getTileAt(-1, 2).type).to.equal('water');

            let path = map.shortestPathBetweenPoints(-2, 2, 2, -2);
            expect(pathToString(path)).to.equal('ddddrruuuurrdddd');

            'up up right right down down down down'
                .split(' ').forEach(move => map.playerMoved(<any> move));


            expect(map.position).to.deep.equal({ x: 2, y: -2 });
            expect(map.getTileInDirection('left').type).to.equal('water');
            expect(map.getTileInDirection('up').type).to.equal('grass');
            expect(map.getTileInDirection('right')).to.equal(undefined);
            expect(map.getTileInDirection('down')).to.equal(undefined);

            map.discover(mapTiles `
                grass water    grass water grass
                grass water    grass water grass
                water water    grass water grass
                grass water    grass water water
                grass mountain grass water mountain
            `);

            path = map.shortestPathBetweenPoints(-2, 2, 0, -3);
            expect(pathToString(path)).to.equal('dddddrruuuurrddddddllu');
        });
    });
});
