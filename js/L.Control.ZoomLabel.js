L.Control.ZoomLabel = L.Control.extend({
    options: {
        position: 'bottomleft',
        contents: ''
    },

    onAdd: function (map) {
        this._container = L.DomUtil.create('div', 'leaflet-control-zoomlabel');
        L.DomEvent.disableClickPropagation(this._container);
        map.on('zoomend', this._onZoomend, this);
        this._setContent(map.getZoom());
        return this._container;
    },

    onRemove: function (map) {
        map.off('zoomend', this._onZoomend);
    },

    _onZoomend: function(e) {
        this._setContent(e.target._zoom);
    },

    _setContent: function(zoomLevel) {
        var contents = this.options.contents;
        if (contents instanceof Function) {
          this._container.innerHTML = contents(zoomLevel);
        } else if (this.options.contents.length > 0) {
          this._container.innerHTML = this.options.contents.replace('{zoom}', zoomLevel);
        } else {
          this._container.innerHTML = zoomLevel;
        }
    }
});

L.control.zoomLabel = function (options) {
    return new L.Control.ZoomLabel(options);
};
