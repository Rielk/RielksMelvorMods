export class Encoder {
    static encode(construction, writer) {
        const _constructionVersion = 2;
        writer.writeUint32(_constructionVersion);
        writer.writeSet(construction.hiddenRooms, writeNamespaced);
        //End of version 1
        construction.stats.encode(writer);
    }

    static decode(construction, reader) {
        const _constructionVersion = this.getVersion(reader);
        if (_constructionVersion <= 0)  //This was before the encode/decode was used.
            return;
        
        construction.hiddenRooms = reader.getSet(readNamespacedReject(construction.rooms));
        
        if (_constructionVersion <= 1) 
            return;

        construction.stats.decode(reader);
    }

    static getVersion(reader) {
        try {
            return reader.getUint32();
        } catch {
            return 0;
        }
    }
}
