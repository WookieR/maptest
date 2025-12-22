// const { Geolocation } = require('@capacitor/geolocation'); 

addEventListener('runGeolocationCheck', async (resolve, reject, args) => {
  try {
    console.log('Background runner is executing geolocation check...');
    
    // Use the native Geolocation API to get current position
    // const position = await Geolocation.getCurrentPosition();
    
    // console.log('Location retrieved:', position.coords.latitude, position.coords.longitude);

    // You can use fetch to send this data to your backend
    // const response = await fetch('your-api.com', { ... });

    // Or save it to Capacitor Preferences to access from your main app later
    // await Capacitor.Plugins.Preferences.set({ key: 'lastKnownLocation', value: JSON.stringify(position) });

    // IMPORTANT: Call resolve() when done
    // resolve({ status: 'success', location: position.coords });
    // resolve();
    resolve();
  } catch (err) {
    console.error('Background runner error:', err);
    reject(err);
  }
});