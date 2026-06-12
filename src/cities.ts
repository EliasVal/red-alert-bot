import axios from 'axios';

type CitiesResponse = {
  cities: {
    [index: string]: City;
  };
};

type City = {
  id: number;
  he: string;
  en: string;
  ru: string;
  ar: string;
  es: string;
  area: number;
  countdown: number;
  lat: number;
  lng: number;
};

export async function getCities(): Promise<Record<string, City>> {
  return (await axios.get<CitiesResponse>('https://www.tzevaadom.co.il/static/cities.json')).data.cities;
}
