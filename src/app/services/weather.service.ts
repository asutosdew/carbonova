import { Injectable, signal } from '@angular/core';
import { WeatherInfo } from '../models/farmer.model';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  // Live Reactive Weather State
  readonly weather = signal<WeatherInfo>({
    temp: 28,
    condition: 'Partly Cloudy',
    location: 'Ambikapur, CG',
    humidity: 62,
    windSpeed: '9 km/h',
    rainChance: '10%',
    icon: '⛅',
    source: 'default',
    sourceLabel: 'Default Location',
    isLoading: false
  });

  // WMO Weather Interpretation Codes (WW)
  private mapWmoCode(code: number): { condition: string; icon: string; rainChance: string } {
    switch (code) {
      case 0:
        return { condition: 'Clear Sky', icon: '☀️', rainChance: '0%' };
      case 1:
        return { condition: 'Mainly Clear', icon: '🌤️', rainChance: '5%' };
      case 2:
        return { condition: 'Partly Cloudy', icon: '⛅', rainChance: '15%' };
      case 3:
        return { condition: 'Overcast', icon: '☁️', rainChance: '25%' };
      case 45:
      case 48:
        return { condition: 'Foggy', icon: '🌫️', rainChance: '20%' };
      case 51:
      case 53:
      case 55:
        return { condition: 'Light Drizzle', icon: '🌦️', rainChance: '60%' };
      case 61:
      case 63:
        return { condition: 'Moderate Rain', icon: '🌧️', rainChance: '85%' };
      case 65:
        return { condition: 'Heavy Rain', icon: '🌧️', rainChance: '95%' };
      case 80:
      case 81:
      case 82:
        return { condition: 'Rain Showers', icon: '🌦️', rainChance: '80%' };
      case 85:
      case 86:
        return { condition: 'Snow Showers', icon: '🌨️', rainChance: '70%' };
      case 95:
      case 96:
      case 99:
        return { condition: 'Thunderstorm', icon: '⛈️', rainChance: '90%' };
      default:
        return { condition: 'Partly Cloudy', icon: '⛅', rainChance: '10%' };
    }
  }

  /**
   * Initializes automatic weather fetching:
   * 1. Attempts HTML5 Geolocation to fetch live user GPS coordinates.
   * 2. If permission denied, timed out, or unavailable, seamlessly falls back to profile city.
   */
  async detectAndFetchWeather(profileCityFallback: string = 'Ambikapur, CG'): Promise<void> {
    this.weather.update(w => ({ ...w, isLoading: true }));

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      try {
        const position = await this.getCoordinatesFromBrowser();
        await this.fetchWeatherByCoordinates(
          position.coords.latitude, 
          position.coords.longitude, 
          'gps'
        );
        return;
      } catch (geoError) {
        console.warn('Geolocation unavailable or denied by user. Falling back to profile location.', geoError);
      }
    }

    // Seamless fallback to profile location
    await this.fetchWeatherByCity(profileCityFallback, 'profile');
  }

  private getCoordinatesFromBrowser(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve(pos),
        err => reject(err),
        { timeout: 7000, enableHighAccuracy: false }
      );
    });
  }

  /**
   * Fetches weather using coordinates (lat, lon) and reverse geocodes city name
   */
  async fetchWeatherByCoordinates(lat: number, lon: number, source: 'gps' | 'profile' | 'default'): Promise<void> {
    try {
      this.weather.update(w => ({ ...w, isLoading: true }));

      // Parallel fetch: Open-Meteo live weather + BigDataCloud reverse geocoding
      const weatherPromise = fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
      ).then(res => res.json());

      const geoPromise = fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&localityLanguage=en`
      ).then(res => res.json()).catch(() => null);

      const [weatherData, geoData] = await Promise.all([weatherPromise, geoPromise]);

      if (!weatherData?.current) {
        throw new Error('Invalid weather data structure received');
      }

      const current = weatherData.current;
      const { condition, icon, rainChance } = this.mapWmoCode(current.weather_code);

      // Determine human-friendly location string
      let locName = '';
      if (geoData) {
        const locality = geoData.locality || geoData.city || geoData.principalSubdivision;
        const stateCode = geoData.principalSubdivisionCode?.replace('IN-', '') || geoData.principalSubdivision || '';
        locName = locality ? `${locality}${stateCode ? ', ' + stateCode : ''}` : '';
      }

      if (!locName) {
        locName = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
      }

      this.weather.set({
        temp: Math.round(current.temperature_2m),
        condition,
        location: locName,
        humidity: current.relative_humidity_2m ?? 65,
        windSpeed: `${Math.round(current.wind_speed_10m ?? 10)} km/h`,
        rainChance,
        icon,
        source,
        sourceLabel: source === 'gps' ? 'Live GPS Location' : 'Profile Location',
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching weather by coordinates:', error);
      this.weather.update(w => ({ ...w, isLoading: false }));
    }
  }

  /**
   * Geocodes city string using Open-Meteo Geocoding API and fetches weather
   */
  async fetchWeatherByCity(cityName: string, source: 'profile' | 'default'): Promise<void> {
    try {
      this.weather.update(w => ({ ...w, isLoading: true }));

      // Clean city name (e.g. "Ambikapur, Chhattisgarh" -> "Ambikapur")
      const cleanCity = cityName.split(',')[0].trim() || 'Ambikapur';

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCity)}&count=1&language=en&format=json`
      );
      const geoJson = await geoRes.json();

      if (geoJson.results && geoJson.results.length > 0) {
        const place = geoJson.results[0];
        const lat = place.latitude;
        const lon = place.longitude;

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
        );
        const weatherData = await weatherRes.json();
        const current = weatherData.current;
        const { condition, icon, rainChance } = this.mapWmoCode(current.weather_code);

        const stateAbbr = place.admin1 ? place.admin1.slice(0, 2).toUpperCase() : 'CG';
        const displayName = `${place.name}, ${stateAbbr}`;

        this.weather.set({
          temp: Math.round(current.temperature_2m),
          condition,
          location: displayName,
          humidity: current.relative_humidity_2m ?? 60,
          windSpeed: `${Math.round(current.wind_speed_10m ?? 10)} km/h`,
          rainChance,
          icon,
          source,
          sourceLabel: `Profile City (${place.name})`,
          isLoading: false
        });
        return;
      }

      // Fallback coordinates for Ambikapur, Chhattisgarh if geocoding yields no results
      await this.fetchWeatherByCoordinates(23.12, 83.20, source);
    } catch (err) {
      console.warn('City geocoding/weather failed, using default values', err);
      this.weather.update(w => ({
        ...w,
        location: cityName,
        source,
        sourceLabel: 'Profile Default',
        isLoading: false
      }));
    }
  }
}
