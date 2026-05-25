// Stub leaflet — it tries to access DOM APIs not available in jsdom
const leaflet = {
  map:           jest.fn().mockReturnValue({ remove: jest.fn(), on: jest.fn(), setView: jest.fn() }),
  tileLayer:     jest.fn().mockReturnValue({ addTo: jest.fn() }),
  marker:        jest.fn().mockReturnValue({ addTo: jest.fn(), remove: jest.fn(), setLatLng: jest.fn() }),
  icon:          jest.fn(),
  latLng:        jest.fn((lat, lng) => ({ lat, lng })),
  LatLng:        jest.fn(),
};
export default leaflet;
module.exports = leaflet;
