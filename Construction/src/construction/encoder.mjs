export class Encoder {
    static encode(construction, writer) {
        const _constructionVersion = 0;
        writer.writeUint32(_constructionVersion);
        writer.writeSet(construction.hiddenRooms, writeNamespaced);
        construction.stats.encode(writer);
        writer.writeArray(construction.fixtures.allObjects, (fixture, writer) => {
            writer.writeNamespacedObject(fixture);
            writer.writeUint32(fixture.currentTier);
            writer.writeUint32(fixture.progress);
        });
    }

    static decode(construction, reader) {
        const _constructionVersion = reader.getUint32();
        
        construction.hiddenRooms = reader.getSet(readNamespacedReject(construction.rooms));
        construction.stats.decode(reader);
        const readFixture = readNamespacedReject(construction.fixtures);
        reader.getArray((reader) => {
            const fixture = readFixture(reader) ?? {};
            fixture.currentTier = reader.getUint32();
            fixture.progress = reader.getUint32();
        });
    }
}
