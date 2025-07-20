import { Test, TestingModule } from '@nestjs/testing';
import { GeoService } from './geo.service';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GeoService', () => {
  let service: GeoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeoService],
    }).compile();

    service = module.get<GeoService>(GeoService);
  });

  it('should return distance and duration when API responds OK', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        rows: [
          {
            elements: [
              {
                status: 'OK',
                distance: { text: '10 km', value: 10000 },
                duration: { text: '15 mins', value: 900 },
              },
            ],
          },
        ],
      },
    });

    const result = await service.getDistanceAndDuration('origin', 'destination');

    expect(result).toEqual({
      distanceText: '10 km',
      distanceValue: 10000,
      durationText: '15 mins',
      durationValue: 900,
    });
  });

  it('should throw InternalServerErrorException when element status is not OK', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        rows: [
          {
            elements: [
              {
                status: 'NOT_FOUND',
              },
            ],
          },
        ],
      },
    });

    await expect(service.getDistanceAndDuration('origin', 'destination'))
      .rejects.toThrow(InternalServerErrorException);
  });

  it('should throw InternalServerErrorException when axios.get throws error', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    await expect(service.getDistanceAndDuration('origin', 'destination'))
      .rejects.toThrow(InternalServerErrorException);
  });
});
