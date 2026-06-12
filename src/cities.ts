import axios from 'axios';

export type CitiesResponse = {
  cities: {
    [index: string]: City;
  };
  areas: {
    [index: string]: {
      en: string;
      he: string;
    };
  };
};

export type City = {
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

export async function getCities(): Promise<CitiesResponse> {
  return (await axios.get<CitiesResponse>('https://www.tzevaadom.co.il/static/cities.json')).data;
}
