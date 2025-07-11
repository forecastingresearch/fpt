Demo [here](https://experiment.quorumapp.com/fpt_demo/).

Experiment is built using [jsPsych v7](). The structure is modular with each file defining an individual task, using a class. Classes are then imported in `index.html`. Each task class defines the task's data, trials and timeline, among other stuff (exclusion criteria, task-specific settings, instructions) and the timelines are added to the master timeline in `index.html`. Additional functionality is also defined in separate files (dev settings - `initialise_dev_settings.js` - and custom trial timer - `trial_timer_module.js`).

Changes are made to `save_data_json.js` as the backend was hosted on an AWS server, running `expressJS` and `mySQL` database. Functionality is copied over here into the `save_data_json.js` file and is maximally preserved, with the difference that instead of making POST requests, here we `console.log()` the data.

Note that due to copyright restrictions imposed by Western Psychological Services, the Shipley tasks cannot be shared at all, not even example items.

# Denominator Neglect

Two errors were identified in the used version for publication (and rectified here):
- `choice_type` was set incorrectly for both anchor forms (fixed during data processing)
- display types were designed to be fixed, but the initial indexing of the anchor forms was incorrectly set up so that did not work (i.e. anchoring for that feature did not work, so the the display types were more closely resembling a random process); this is rectified here and will work as expected