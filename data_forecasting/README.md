Raw data (`raw_data`) contains anonymized qualtrics files (IPAddress, LocationLatitude, LocationLongitude were removed, see [here](../README.md#anonymization-procedure)).

The raw qualtrics files are ingested by the processing pipeline in `FPT Forecasting.Rmd`.

The processed data is found in `processed_data`. All the `.csv` tables can be found in the `scores_all.RData` file, where they are saved as variables with the same names as their `.csv` counterparts. Codebooks for each dataset can be found in [codebook.md](./codebook.md).

# Data processing notes

* wave 0 (`dat0`) is part of wave 1 data (`dat1`) and they are merged
* `forecast_type` column in the processed data files has the following abbrevations: `p`=probability; `q`=quantile `c`=conditional
* Mean/SD are trimmed for S-score and absolute difference scores and not trimmed for Brier scores. Reason: the forecasts for quantile questions had some crazy outliers, which affected S-scores as well. Not an issue for probability questions.
* S-scores and absolute differences scores were winsorized, but not Brier scores. Because these scores are the smaller the better and the smallest possible value is 0. No one was 5 sds smaller than the mean score but they could easily be 5 sds larger than the mean score if they were wildly incorrect.
* resolutions - different columns can be two different questions or the same question with different time horizons; we avoid merging resolutions with forecasts that are not directly related to them.

