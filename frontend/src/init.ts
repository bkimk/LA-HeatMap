export async function initMap() {
    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    return new Map(document.getElementById("map")!, {
        center: { lat: 33.9761292, lng: -118.2238288 },
        zoom: 10,
    });
}

export async function initHeatMap(map: google.maps.Map) {
    const { HeatmapLayer } = await google.maps.importLibrary("visualization") as google.maps.VisualizationLibrary;
    return new HeatmapLayer({
        map,
        radius: 10,
        maxIntensity: 5,
    });

}