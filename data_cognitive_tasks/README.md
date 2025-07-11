Note that data for the Shipley task is not shared raw - only processed data is available, due to copyright restrictions.

# Data processing logic

The entire data processing happens in `fpt.Rmd`. The raw data used as input are the individual session files in `raw_session_data` along with the database tables used on the backend, found in `metadata_tables`. Each task's data is processed and scored in `fpt.Rmd` with resulting processed datasets found in `task_datasets`. Files is `cache` are used during the processing inside `fpt.Rmd` to speed up subsequent (re)runs.

# Processed data

If you want to use our data, you'd probably want the processed data straight away. For this, you'd want to look in `task_datasets` folder, `metadata_tables` folder, and the `shipley_scores.csv`.

Task-specific datasets are defined by their `session_id`, while metadata information about each `session_id` can be found in all other files.

The columns of each task-specific dataset are task-dependent. Exceptions are admc, coherence forecasting scale, and graph literacy, where two datasets are found in `task_datasets` - one with the raw data (e.g. `rt`, participant response etc), and one with the scores (as the scores are not computed per trial); the suffix of the file defines this. All the `.csv` tables can be found in the .RData files, where they are saved as variables with the same names as their `.csv` counterparts.

Metadata about each `session_id` is found in other tables:
- `metadata/session.csv` includes information about whether the session is completed (`completed`), `subject_id`, `form`, `wave`, `task_order_indices` (tasks order)
- `metadata/data_checkpoint.csv` includes information about when each `session_id` reached various defined checkopoints (see `materials` folder in ROOT for more information)
- `metadata/session_restarts.csv` includes information about when participants restarted a session (e.g. closed the browser and came back to the task later using the same link they had)
- `metadata/subject_id_group.csv` includes information about the `group` status of each `subject_id` - either superforecaster (`sup`) or not (`reg`)
- `metadata/task_aig_version.csv` includes information, in long format, about AIG version (`AIG` or `anchor`) for each `session_id` and `task`
- `metadata/final_completers.csv` is a list of `subject_id`s who completed wave 7

# Denominator Neglect

There were a few technical (non-consequential) issues during the runtime of this task.

First, the reaction time timings (`rt`) in raw data were sometimes incorrect due to a technical error (some timers were not being cleared properly at end of some trials so the timings merged between trials or registered on incorrect trials). After a careful examination, we determined that we can replace those with RTs based on `time_elapsed` the differences were in the sub-10ms range. This is done during the processing of the data and comments provided.

Second, `choice_type` was incorrectly saved on the anchor forms for both task versions. During the data processing, this error is rectified.

Third, anchor forms were intended to define that display type of each trial. For instance, the second conflict trial on task version A was meant to be 'text' display for the small lottery and 'array' display for the large lottery. Due to a technical error (see materials folder's README), this was not the case and the anchor form for task version A functioned more closely like an AIG version (i.e. display types were more closely to random). This implies that the anchoring of the display types of task version A did not work. The other anchor manipulations on task version A worked as intended and also this issues does not apply to task version B.

Fourth, one subject somehow completed both task versions twice (`session_id`: s4lfGSEuzwFcs9VPAahaEoktnZ), and ony the first attempt is preserved.