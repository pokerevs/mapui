L.UCluster = L.UGeoJSONLayer.extend({
  initialize: function (uOptions, options) {
    L.UGeoJSONLayer.prototype.initialize.call(this, uOptions, options);
    this.markers = L.markerClusterGroup();
  },

  //Parts of L.FeatureGroup and L.LayerGroup
  addLayer: function (layer) {
    if (this.hasLayer(layer)) {
      return this;
    }
    var id = this.getLayerId(layer);
    this._layers[id] = layer;

    this.markers.addLayer(layer);
    return this.fire('layeradd', {layer: layer});
  },

  removeLayer: function (layer) {
    this.markers.removeLayer(layer);
    return this;
  },

  clearLayer: function() {
    console.log("clearLayer");
    this.markers.clearLayer()
    return this;
  },

  addTo: function(map) {
    console.log("addTo");
    map.addLayer(this.markers);
    map.addLayer(this);
    return this;
  },

  /*
  _layerAdd: function (e) {
    console.log("_layerAdd");
    L.GeoJSON.prototype._layerAdd.call(this, e);
  }

  */

});

L.uCluster = function (uOptions, options) {
  return new L.UCluster(uOptions, options);
};
