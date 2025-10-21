export function haversineDistanceKM(originCoordinate: any, destinyCoordinate: any) {
    function toRad(degree: any) {
        return degree * Math.PI / 180;
    }
    
    const lon1 = toRad(originCoordinate.split(',')[0]);
    const lat1 = toRad(originCoordinate.split(',')[1]);
    const lon2 = toRad(destinyCoordinate.split(',')[0]);
    const lat2 = toRad(destinyCoordinate.split(',')[1]);
    
    const { sin, cos, sqrt, atan2 } = Math;
    
    const R = 6371; // earth radius in km 
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = sin(dLat / 2) * sin(dLat / 2)
            + cos(lat1) * cos(lat2)
            * sin(dLon / 2) * sin(dLon / 2);
    const c = 2 * atan2(sqrt(a), sqrt(1 - a)); 
    const d = R * c;
    return Math.round((d + Number.EPSILON) * 100) / 100; // distance in km
}