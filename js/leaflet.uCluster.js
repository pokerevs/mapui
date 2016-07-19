L.UCluster = L.UGeoJSONLayer.extend({
  initialize: function (markerOptions, uOptions, options) {
    L.UGeoJSONLayer.prototype.initialize.call(this, uOptions, options);
    this.markers = L.markerClusterGroup(markerOptions);
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
    this.markers.clearLayer()
    return this;
  },

  addTo: function(map) {
    map.addLayer(this.markers);
    map.addLayer(this);
    return this;
  }
});

L.uCluster = function (markerOptions, uOptions, options) {
  return new L.UCluster(markerOptions, uOptions, options);
};
