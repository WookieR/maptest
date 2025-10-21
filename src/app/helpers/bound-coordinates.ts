function getSWCoordinates(coordinatesCollection: any[]) {
  const lowestLng = Math.min(
    ...coordinatesCollection.map((coordinates) => coordinates[0])
  );
  const lowestLat = Math.min(
    ...coordinatesCollection.map((coordinates) => coordinates[1])
  );

  return [lowestLng, lowestLat];
}

function getNECoordinates(coordinatesCollection: any[]) {
  const highestLng = Math.max(
    ...coordinatesCollection.map((coordinates) => coordinates[0])
  );
  const highestLat = Math.max(
    ...coordinatesCollection.map((coordinates) => coordinates[1])
  );

  return [highestLng, highestLat];
}

export function calcBoundsFromCoordinates(coordinatesCollection: any[]): any {
  return [
    getSWCoordinates(coordinatesCollection),
    getNECoordinates(coordinatesCollection),
  ];
}