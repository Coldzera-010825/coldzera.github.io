# London WOW spatial demonstration

Uses the existing screened [Met Office WOW](https://wow.metoffice.gov.uk/) hourly display series for the 15:00 UTC buckets on 18 and 19 July 2022. Stations must lie inside the official Greater London Authority boundary. Locations in the same 100 m bin are averaged. WOW data are subject to the [source licence](https://wow.metoffice.gov.uk/support/licence).

Ordinary kriging in British National Grid (EPSG:27700). A robust exponential variogram fit uses 4 km lag bins, a 7–35 km practical range, a partial sill constrained to 0.2–2 times the sample variance, and a nugget constrained to 0–0.8 times the sample variance. These constraints keep poorly identified fits at a city scale and are assumptions for this exploratory display. For wind direction, calm samples under 0.1 m/s are excluded, the sine and cosine are kriged separately, and pixels with weak directional agreement are masked. Constant samples render as a flat value. Pixels more than 8 km from an input location and all pixels outside Greater London are transparent. Colour ranges are fixed across the two dates per variable, with values beyond the range shown in the end colours.

These are exploratory estimates from citizen observations. The image sampling density is a display setting. It does not imply measurement resolution or validation accuracy.
