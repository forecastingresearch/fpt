# Shared Variables

Variables that can be found across different files:

+ `subject_id` - participant ID
+ `group` - “reg”: general public, recruited online (only those who completed all 7 waves); “sup”: superforecasters with record of high forecasting accuracy
+ `wave` - survey number (note: available waves differ by file)
+ `fcOrder` - the condition that each participant was assigned to (five possible conditions, deciding which forms of questions they received in each wave)
+ `form` - the form that each item belongs to (six possibe forms; the set of forecasting questions varies by file)
+ `item` - item ID
+ `resolution_31May2024` - the actual outcome of the question
+ `unit` - the unit of the forecasted quantity

# Quantile Forecasts - `scores_quantile.csv`, `dat_quant_wide`

This file also includes the shared variables: `subject_id`, `group`, `wave`, `fcOrder`, `form`, `item`, `resolution_31May2024`, `unit`.

Dataset-specific variables:

+ `1`, `2`, `3`, `4`, `5` - Quantile responses; the respondent’s numeric inputs for the 5%, 25%, 50%, 75%, and 95% quantiles
+ `0.05`, `0.25`, `0.5`, `0.75`, `0.95` - S-scores for each quantile
+ `total_score` - the sum of S-scores across the 5 quantiles
+ `sscore_standardized` - standardized S-score (standardized using the mean and standard deviation of the middle 80% of the participants for this item in this wave within the “reg” or “sup” group; scores larger than 5 were replaced by 5)
+ `sscore_standardized_to_reg` - standardized S-score for the “sup” group using the trimmed 80% mean and standard deviation of the “reg” group for this item in this wave (scores larger than 5 were replaced by 5; NA for all “reg” group participants)

# Probability Forecast with Pre-set Bins - `scores_probability with pre-set bins.csv`, `dat17_prob_wide`

This file also includes the shared variables: `subject_id`, `group`, `wave`, `fcOrder`, `form`, `item`, `resolution_31May2024`, `unit`.

Dataset-specific variables:

+ `1`, `2`, `3`, `4`, `5` - the probability assigned to each bin by the respondent
+ `bin_number` - the pre-set bin into which the outcome fell
+ `obscore` - ordinal Brier score for the respondent on this item
+ `obscore_standardized` - standardized ordinal Brier score (standardized using the mean and standard deviation of the participants for this item in this wave within the “reg” or “sup” group)
+ `obscore_standardized_to_reg` - standardized ordinal Brier score for the “sup” group using the “reg” group’s mean and standard deviation for this item in this wave (NA for all “reg” group participants)

# Binary Probability Forecast - `scores_binary probability.csv`, `dat_binary_wide`

This file also includes the shared variables: `subject_id`, `group`, `wave`, `fcOrder`, `item`.

Dataset-specific variables:

+ `forecast` - the probability reported by the respondent
+ `bscore` - Brier score for the respondent on this item
+ `bscore_standardized` - standardized Brier score (standardized using the mean and standard deviation of the participants for this item in this wave within the “reg” or “sup” group)
+ `bscore_standardized_to_reg` - standardized Brier score for the “sup” group using the “reg” group’s mean and standard deviation for this item in this wave (NA for all “reg” group participants)

# Conditional Forecast - `scores_conditional.csv`, `dat_conditional_wide`

This file also includes the shared variables: `subject_id`, `group`, `wave`, `fcOrder`, `form`, `item`, `resolution_31May2024`, `unit`.

Dataset-specific variables:

+ `forecast` - the respondent’s single best estimate for the quantile question given the true outcome of the associated binary question
+ `diff` - the absolute difference between the forecast and the resolution
+ `diff_standardized` - standardized error (the absolute difference standardized using the mean and standard deviation of the middle 80% of the participants for this item in this wave; scores larger than 5 were replaced by 5)
+ `diff_standardized_to_reg` - standardized error for the “sup” group using the trimmed 80% mean and standard deviation of the “reg” group for this item in this wave (scores larger than 5 were replaced by 5; NA for all “reg” group participants)