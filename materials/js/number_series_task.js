export default class Number_Series {
    constructor(jsPsych, Experiment, task_query_string) {
        this.duration_mins = 4
        this.prettyname = "Number Series"
        this.browser_requirements = {min_width: 840, min_height: 500, mobile_allowed: false}
        this.media = []
        this.media_promises = []
        this.exclusion_criteria = []
        
        this.jsPsych = jsPsych;
        this.Experiment = Experiment;

        this.modifiable_settings = this.get_modifiable_settings();
        this.default_settings = this.get_default_settings();
        this.settings = this.get_updated_settings_from_query(task_query_string);
        this.task_data = this.get_task_data();
        this.define_trials();
        this.timeline = this.get_timeline();

    }

    get_modifiable_settings() {
        let modifiable_settings = [
            {
                variable: 'SHOW_TASK',
                query_shortcode: 'show',
                prettyname: 'Show the task',
                input_type: 'checkbox'
            },
            {
                variable: 'TASK_ORDER_INDEX',
                query_shortcode: 'toi',
                prettyname: 'Task order index in the experiment',
                input_type: 'number'
            }
        ]
        return modifiable_settings
    }

    get_default_settings() {
        let settings = {}
        settings.SHOW_TASK = true
        settings.TASK_ORDER_INDEX = -999

        settings.DATA = [
            {
                id: "NS_1",
                prompt: "10, 4, ____, -8, -14, -20",
                simulation_range: [-20, 10]
            },
            {
                id: "NS_2",
                prompt: "3, 6, 10, 15, 21, ____",
                simulation_range: [0, 25]
            },
            {
                id: "NS_3",
                prompt: "121, 100, 81, ____, 49",
                simulation_range: [49, 121]
            },
            {
                id: "NS_4",
                prompt: "3, 10, 16, 23, ____, 36",
                simulation_range: [3, 36]
            },
            {
                id: "NS_5",
                prompt: "3/21, ____, 13/11, 18/6, 23/1, 28/-4",
                simulation_range: [-1, 20]
            },
            {
                id: "NS_6",
                prompt: "200, 198, 192, 174, ____",
                simulation_range: [150, 250]
            },
            {
                id: "NS_7",
                prompt: "3, 2, 10, 4, 19, 6, 30, 8, ____",
                simulation_range: [0, 40]
            },
            {
                id: "NS_8",
                prompt: "10000, 9000, ____, 8890, 8889",
                simulation_range: [8000, 10000]
            },
            {
                id: "NS_9",
                prompt: "3/4, 4/6, 6/8, 8/12, ____",
                simulation_range: [0, 10]
            }
        ]
        settings.TEST_TRIALS_N = settings.DATA.length
        settings.TEST_TRIALS_PER_BLOCK = settings.DATA.length
        settings.TEST_BLOCKS = 1

        return settings
    }

    get_updated_settings_from_query(query_string) {
        // this could be in a generic Task class
        // the query params will always be in the format: task_name=setting1_prettyname,setting1_value,setting2_prettyname,setting2_value
        let settings = _.cloneDeep(this.default_settings)
        let query_arr = query_string.split(",")
        for (let i=0; i<query_arr.length; i+=2) {
            let curr_setting_obj = this.modifiable_settings.filter(e=>e.query_shortcode==query_arr[i])[0]
            if (curr_setting_obj) {
                let task_setting_type = typeof this.default_settings[curr_setting_obj.variable]
                settings[curr_setting_obj.variable] = this.Experiment.helper_funcs.string_to_type(query_arr[i+1], task_setting_type)
            }
        }
        if (Object.keys(settings).includes('SHORT_VERSION')) {
            if (settings.SHORT_VERSION) {
                let short_version_trials = this.get_short_version_trials()
                settings = _.merge(_.cloneDeep(settings), short_version_trials)
            }
        }
        return settings
    }

    get_task_data() {
        const task_data = {'pt_trials': {}, 'test_trials': {}}
    
        // ------------------------TEST TRIALS DATA
        for (let test_trial_ind = 0; test_trial_ind < this.settings.TEST_TRIALS_N; test_trial_ind++) {
            const test_block_ind = Math.floor(test_trial_ind / this.settings.TEST_TRIALS_PER_BLOCK)
            const test_block_key = this.Experiment.helper_funcs.format_ind_to_key(test_block_ind, 'block')
            let test_trial_key = this.Experiment.helper_funcs.format_ind_to_key(test_trial_ind, 'trial')
    
            // only create block if it does not exist; see https://stackoverflow.com/q/66564488/13078832
            if (!task_data['test_trials'][test_block_key]) {
                task_data['test_trials'][test_block_key] = {}
            }
            task_data['test_trials'][test_block_key][test_trial_key] = {
                'pt_trial': false,
                'block': test_block_ind, 
                'trial': test_trial_ind,
                'id': this.settings.DATA[test_trial_ind].id,
                'prompt': this.settings.DATA[test_trial_ind].prompt,
                'simulation_range': this.settings.DATA[test_trial_ind].simulation_range
            }
        }
        return task_data
    }

    define_trials() {
        // it's quite common to refer to both the current trial context so this causes context conflict for the this keyword
        // therefore, for this method we will use self to refer to the class and this will be for whatever the current context is
        let self = this;

        self.general_instructions = {
            type: jsPsychInstructions,
            pages: [`<p class="instructions-title" style="text-align: center">Number series task</p>
                    <p>In this section, you will be presented with nine sequences of numbers. Your task is to find the number that should go in the blank to complete each sequence.</p>
                    <p>For example, consider the following series: 2, 4, 3, 9, 4, ____. For this series, the correct answer is 16, because the series presents a sequence of consecutive numbers (2, 3, 4), each of which is followed by the same number squared: 2 squared is 4, 3 squared is 9, and 4 squared is 16. This is just one example: The number sequences presented to you will involve various patterns or rules.</p>
                    <p>Note: Only the kinds of characters presented in the series (e.g., numbers, slashes, minus signs) may be typed in the text boxes.</p>
                    `],
            show_clickable_nav: true,
            allow_backward: false,
            allow_keys: false,
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 120,
            on_finish: function(data) {
                data.trial_name = "number_series_instructions"
            }
        }

        self.test_trial = {
            type: jsPsychSurveyText,
            preamble: `<p id="error_text" style="color: red; font-style: italic; visibility: hidden;">Please enter a valid number</p>`, 
            questions: function() {
                return [{
                    name: self.jsPsych.timelineVariable('id'),
                    prompt: self.jsPsych.timelineVariable('prompt'),
                    required: false,
                    placeholder: "What's the missing number?"
                }]
            },
            on_load: function() {
                if (!self.Experiment.settings.IGNORE_VALIDATION && !self.Experiment.settings.SIMULATE) {
                    let error_text = document.getElementById('error_text')
                    let continue_button = document.getElementById('jspsych-survey-text-next')
                    let numbers_input = document.getElementById('input-0')
    
                    const regex = self.jsPsych.timelineVariable('prompt').includes("/") ? /^-?\d+\/-?\d+$/ : /^-?\d+$/
                    continue_button.disabled = true
                    numbers_input.addEventListener('input', function(e) {
                        if (regex.test(e.target.value) || e.target.value == '') {
                            error_text.style['visibility'] = 'hidden'
                            continue_button.disabled = false
                        } else {
                            error_text.style['visibility'] = 'visible'
                            continue_button.disabled = true
                        }
                    })
                }
            },
            css_classes: ['content_size'],
            timer: 30,
            on_finish: function(data) {
                data.trial_name = "number_series_test_trial"
                data.ns_id = self.jsPsych.timelineVariable('id')
                data.ns_response = data.response ? parseInt(data.response[data.ns_id]) : undefined;
            },
            simulation_options: function() {
                let data = {
                    response: {}, 
                    rt: self.Experiment.settings.SIMULATE_TRIAL_DURATION
                };
                let simulation_range = self.jsPsych.timelineVariable("simulation_range")
                data.response[self.jsPsych.timelineVariable("id")] = `${self.jsPsych.randomization.randomInt(simulation_range[0], simulation_range[1])}`
                return {data: data};
            }
            
        }
    }

    get_timeline() {
        let timeline = []
        if (this.Experiment.saved_progress.data_checkpoints.includes(`${this.prettyname}__completed`)) {
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
        } else {
            timeline.push(this.Experiment.trial_generators.wait_for_media_load(this))
            timeline.push(this.Experiment.trial_generators.add_task_stylesheet("number_series_task"))
            if (this.Experiment.settings.INSTRUCTIONS_ONLY) {
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Number series.'], show_clickable_nav: true})
                timeline.push(this.general_instructions)
            } else {
                const test_trials_timeline = this.Experiment.helper_funcs.get_task_trials_timeline_with_interblock_text([this.test_trial], 
                    this.settings.TEST_BLOCKS, 
                    null,
                    // timeline_main_trials_interblock_timeline, 
                    this.task_data.test_trials,
                    'test')
                timeline.push(this.general_instructions)
                timeline.push(this.Experiment.hide_progress_bar())
                timeline.push(test_trials_timeline)
            }
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
            timeline.push(this.Experiment.trial_generators.get_task_feedback(this.prettyname))
            timeline.push(this.Experiment.trial_generators.remove_task_stylesheet("number_series_task"))
            timeline.push(this.Experiment.trial_generators.exclusion_timeline(this.exclusion_criteria))
            timeline.push(this.Experiment.trial_generators.async_data_save(`${this.prettyname}__completed`))
        }
        return {timeline: timeline}
    }
}