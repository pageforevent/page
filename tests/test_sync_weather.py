import unittest
from datetime import datetime
from scripts.sync_weather import KST, LATITUDE, LONGITUDE, api_items, kma_grid, make_snapshot, publication_times


def observations(pty=0):
    return [{"category": key, "obsrValue": value} for key, value in
            {"T1H": "20.5", "WSD": "6.2", "PTY": str(pty)}.items()]


def forecasts(sky=1, lightning=0):
    return [{"category": key, "fcstValue": str(value), "fcstDate": "20261014", "fcstTime": "1700"}
            for key, value in {"SKY": sky, "LGT": lightning}.items()]


class WeatherTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 10, 14, 17, 7, tzinfo=KST)
        self.observed, self.forecast_base = publication_times(self.now)

    def test_bujeon_grid(self):
        self.assertEqual(kma_grid(LATITUDE, LONGITUDE), (98, 75))

    def test_publication_lag_and_midnight(self):
        self.assertEqual(self.observed.hour, 16)
        self.assertEqual(self.forecast_base.strftime("%H%M"), "1530")
        observed, forecast = publication_times(datetime(2026, 11, 1, 0, 7, tzinfo=KST))
        self.assertEqual(observed.strftime("%Y%m%d%H%M"), "202610312300")
        self.assertEqual(forecast.strftime("%Y%m%d%H%M"), "202610312230")

    def test_precipitation_clouds_and_storm(self):
        cases = [(0, 1, 0, "clear"), (0, 3, 0, "cloudy"), (0, 4, 0, "overcast"),
                 (1, 4, 0, "rain"), (2, 4, 0, "sleet"), (3, 4, 0, "snow"),
                 (5, 4, 0, "rain"), (6, 4, 0, "sleet"), (7, 4, 0, "snow"), (1, 4, 1, "storm")]
        for pty, sky, lightning, expected in cases:
            with self.subTest(expected=expected):
                result = make_snapshot(observations(pty), forecasts(sky, lightning),
                                       self.observed, self.forecast_base, self.now)
                self.assertEqual(result["condition"], expected)
                self.assertEqual(result["timezone"], "Asia/Seoul")
                self.assertEqual(result["windSpeed"], 6.2)

    def test_api_errors_and_invalid_values(self):
        with self.assertRaises(ValueError):
            api_items({"response": {"header": {"resultCode": "30"}}})
        with self.assertRaises(ValueError):
            make_snapshot(observations(8), forecasts(), self.observed, self.forecast_base, self.now)
        with self.assertRaises(ValueError):
            make_snapshot(observations(), forecasts(2), self.observed, self.forecast_base, self.now)


if __name__ == "__main__":
    unittest.main()
