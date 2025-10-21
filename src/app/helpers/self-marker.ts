export function getSelfMarker () {
    const element = document.createElement('div');
    element.id = 'self-marker'
    element.style.animation = 'pulse 2s infinite';
    element.style.backgroundImage = "url('/assets/map-icons/blue-circle.svg')";
    element.style.backgroundSize = 'cover'
    element.style.width = '20px',
    element.style.height = '20px',
    element.style.borderRadius = '50%';

    return element;
}