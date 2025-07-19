import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeoService {
  private apiKey = process.env.GOOGLE_MAPS_API_KEY;

  async getDistanceAndDuration(origin: string, destination: string) {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;

    try {
      const response = await axios.get(url, {
        params: {
          origins: origin,
          destinations: destination,
          key: this.apiKey,
        },
      });

      const result = response.data;
      const element = result.rows[0]?.elements[0];

      if (!element || element.status !== 'OK') {
        throw new InternalServerErrorException('Error calculating distance via Google Maps');
      }

      return {
        distanceText: element.distance.text,
        distanceValue: element.distance.value,
        durationText: element.duration.text,
        durationValue: element.duration.value,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error accessing Google Maps API');
    }
  }
}
