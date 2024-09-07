export class ConstructionInterface {
    constructor(ctx, construction) {
        this.ctx = ctx;
        this.construction = construction;

        this.ctx.onInterfaceAvailable(async () => {
            this.ctx.loadStylesheet('src/interface/construction-styles.css');
            this._content = getTemplateNode('rielk-construction');
            document.getElementById('main-container').append(this._content);
        });
    }
}