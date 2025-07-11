export default class Raven_Matrix {
    constructor(jsPsych, Experiment, task_query_string) {
        this.duration_mins = 10
        this.prettyname = "Raven Matrices"
        this.browser_requirements = {min_width: 840, min_height: 500, mobile_allowed: false}
        
        this.jsPsych = jsPsych;
        this.Experiment = Experiment;


        this.modifiable_settings = this.get_modifiable_settings();
        this.default_settings = this.get_default_settings();
        this.settings = this.get_updated_settings_from_query(task_query_string);
        this.set_raven_content();
        this.task_data = this.get_task_data();
        this.define_trials();
        
        this.media = ["img/stimuli/Raven Matrix labels.png"]
        for (let blocks_obj of Object.values(this.task_data)) {
            for (let trials_obj of Object.values(blocks_obj)) {
                for (let trial_data of Object.values(trials_obj)) {
                    this.media.push(`img/stimuli/raven_matrix/${trial_data["stimulus"]}.png`)
                    this.media.push(`img/stimuli/raven_matrix/${trial_data["stimulus"]}_Answers.png`)
                }
            }
        }
        this.media_promises = []
        this.exclusion_criteria = []

        // timeline needs to be after promises
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
            },
            {
                variable: 'SHORT_VERSION',
                query_shortcode: 'sv',
                prettyname: 'Short version (fewer trials)',
                input_type: 'checkbox'
            }
        ]
        return modifiable_settings
    }

    get_default_settings() {
        let settings = {}
        settings.SHOW_TASK = true
        settings.TASK_ORDER_INDEX = -999
        settings.SHORT_VERSION = false

        settings.PT_TRIALS_N = 5,
        settings.PT_TRIALS_PER_BLOCK = 5,
        settings.PT_BLOCKS = settings.PT_TRIALS_N / settings.PT_TRIALS_PER_BLOCK
        settings.TEST_TRIALS_N = 42,
        settings.TEST_TRIALS_PER_BLOCK = 42,
        settings.TEST_BLOCKS = settings.TEST_TRIALS_N / settings.TEST_TRIALS_PER_BLOCK

        this.get_short_version_trials = () => {
            return {
                PT_TRIALS_N : 2,
                PT_TRIALS_PER_BLOCK : 2,
                PT_BLOCKS : 1,
                TEST_TRIALS_N : 4,
                TEST_TRIALS_PER_BLOCK : 4,
                TEST_BLOCKS : 1,
            }
        }
    
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
        // each value for pt_trials and test_trials is an object, whose keys are the trial key (trial_001)
        // and values are objects with key-value pairs representing curr trial variable name-curr trial variable value
        // e.g. {'test_trials': 
        //			 {'trial_001': {
        //			 	'pt_trial': true, 
        //			 	'block': 0,
        //			 	'trial': 5,
        //			 	'myvar': 'myval'
        //			 }, 'trial_002': {...}}}
        const task_data = {'pt_trials': {}, 'test_trials': {}}
    
        const curr_pp_list_indices = this.jsPsych.randomization.sampleWithoutReplacement(this.Experiment.helper_funcs.range(0, this.settings.STIMULI_LISTS.length-1, 1), 2)
        // ------------------------PRACTICE TRIALS DATA
        const pt_trials_stimuli_list = this.settings.STIMULI_LISTS[curr_pp_list_indices[0]]
        for (let pt_trial_ind = 0; pt_trial_ind < this.settings.PT_TRIALS_N; pt_trial_ind++) {	
            const pt_block_ind = Math.floor(pt_trial_ind / this.settings.PT_TRIALS_PER_BLOCK)
            const pt_block_key = this.Experiment.helper_funcs.format_ind_to_key(pt_block_ind, 'block')
            let pt_trial_key = this.Experiment.helper_funcs.format_ind_to_key(pt_trial_ind, 'trial')
    
            // only create block if it does not exist; see https://stackoverflow.com/q/66564488/13078832
            if (!task_data['pt_trials'][pt_block_key]) {
                task_data['pt_trials'][pt_block_key] = {}
            }
            task_data['pt_trials'][pt_block_key][pt_trial_key] = {
                'pt_trial': true,
                'block': pt_block_ind, 
                'trial': pt_trial_ind,
                'list_id': pt_trials_stimuli_list["list_id"],
                'stimulus': pt_trials_stimuli_list["stimuli"][pt_trial_ind],
                'correct_answer': this.settings.CORRECT_ANSWERS[pt_trials_stimuli_list["stimuli"][pt_trial_ind]]
            }
        }
    
        // ------------------------TEST TRIALS DATA
        const test_trials_stimuli_list = this.settings.STIMULI_LISTS[curr_pp_list_indices[1]]
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
                'list_id': test_trials_stimuli_list["list_id"],
                'stimulus': test_trials_stimuli_list["stimuli"][test_trial_ind],
                'correct_answer': this.settings.CORRECT_ANSWERS[test_trials_stimuli_list["stimuli"][test_trial_ind]]
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
            pages: [`<p class="instructions-title" style="text-align: center">Matrix reasoning task</p>
                    <p>In this task, you will see a 3 x 3 matrix of figures on the left, with one element missing. There is a hidden pattern that guides the figure selection in the matrix.</p>
                    <p><b>Your task is</b> to figure out the hidden part and select one figure from the eight options on the right that you think should fill the blank spot in the matrix.</p>
                    <p>You will have 30 seconds per matrix.</p>`],
            show_clickable_nav: true,
            allow_backward: false,
            allow_keys: false,
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 120,
            on_finish: function(data) {
                data.trial_name = "raven_matrix_instructions"
            }
        }
        
        self.pt_trials_instructions = {
            type: jsPsychInstructions,
            pages: [`<p class="instructions-title" style="text-align: center">Matrix reasoning task</p>
                    <p>You will now familiarise yourself with the task. You will complete ${self.settings.PT_TRIALS_N} practice trials.</p>
                    `],
            show_clickable_nav: true,
            allow_backward: false,
            allow_keys: false,
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 120,
            on_finish: function(data) {
                data.trial_name = "raven_matrix_practice_trials_instructions"
            }
        }

        self.test_trials_instructions = {
            type: jsPsychInstructions,
            pages: function() {
                return [`<p class="instructions-title" style="text-align: center">Matrix reasoning task</p>
                    <p>We will now progress to the test trials. You will complete ${self.settings.TEST_TRIALS_N} trials of increasing difficulty.</p>
                    <p><b>Remember that your task is</b> to figure out the hidden pattern behind the figures in the matrix on the left and select which one of the 8 figures on the right is the missing one.</p>
                    `]
            },
            show_clickable_nav: true,
            allow_backward: false,
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 120,
            on_finish: function(data) {
                data.trial_name = "raven_matrix_test_trials_instructions"
            }
        }

        self.test_trial = {
            type: jsPsychSurveyMultiChoice,
            questions: function() {
                return [{
                    name: self.jsPsych.timelineVariable("stimulus"), 
                    prompt: `<div id="container">
                                <div id="stimulus"><img src="img/stimuli/raven_matrix/${self.jsPsych.timelineVariable("stimulus")}.png"></div>
                                <div id="answers"><img src="img/stimuli/raven_matrix/${self.jsPsych.timelineVariable("stimulus")}_Answers.png"></div>
                                <div id="labels"><img src="img/stimuli/Raven Matrix labels.png"></div>
                            </div>`, 
                    options: self.Experiment.helper_funcs.range(1, 8, 1).map(e=>e.toString()),
                    required: !self.Experiment.settings.IGNORE_VALIDATION && !self.Experiment.settings.SIMULATE,
                    horizontal: true
                }]
            },
            css_classes: ['content_size'],
            trial_duration: self.Experiment.settings.SIMULATE ? self.Experiment.settings.SIMULATE_TRIAL_DURATION*1.2 : null,
            timer: 30,
            on_load: function() {
                let jspsych_content_height = parseFloat(window.getComputedStyle(document.querySelector("#jspsych-content")).height.slice(0, -2))
                let container_height = jspsych_content_height*0.7
                document.querySelector("#jspsych-survey-multi-choice-0").style.height = `${container_height}px`
                let stimulus_container_height = container_height*0.7
                document.querySelector("#stimulus").style.height = `${stimulus_container_height}px`
            },
            on_finish: function(data) {
                data.trial_name = "raven_trial"
                data.pt_trial = self.jsPsych.timelineVariable('pt_trial')
                data.block = self.jsPsych.timelineVariable('block')
                data.trial = self.jsPsych.timelineVariable('trial')
                data.list_id = self.jsPsych.timelineVariable("list_id")
                data.stimulus = self.jsPsych.timelineVariable("stimulus")
                data.correct_answer = self.jsPsych.timelineVariable("correct_answer")

                if (typeof data.response === "undefined") {
                    data.response = null
                    data.correct = null
                } else if (Object.keys(data.response).length !== 0) {
                    data.response = parseInt(Object.values(data.response)[0])
                    data.correct = data.response === data.correct_answer
                } else {
                    data.response = null
                    data.correct = null
                }
            },
            simulation_options: 'raven_matrix'
        }
    }

    get_timeline() {
        

        let timeline = []
        if (this.Experiment.saved_progress.data_checkpoints.includes(`${this.prettyname}__completed`)) {
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
        } else {
            timeline.push(this.Experiment.trial_generators.wait_for_media_load(this))
            timeline.push(this.Experiment.trial_generators.add_task_stylesheet("raven_matrix_task"))
            if (this.Experiment.settings.INSTRUCTIONS_ONLY) {
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Raven Matrices - instructions'], show_clickable_nav: true})
                timeline.push(this.general_instructions)
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Raven Matrices - practice trials intro'], show_clickable_nav: true})
                timeline.push(this.pt_trials_instructions)
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Raven Matrices - test trials intro'], show_clickable_nav: true})
                timeline.push(this.test_trials_instructions)
            } else {
                const pt_trials_timeline = this.Experiment.helper_funcs.get_task_trials_timeline_with_interblock_text([this.test_trial], 
                    this.settings.PT_BLOCKS, 
                    null, 
                    this.task_data.pt_trials,
                    'pt')
                const test_trials_timeline = this.Experiment.helper_funcs.get_task_trials_timeline_with_interblock_text([this.test_trial], 
                    this.settings.TEST_BLOCKS, 
                    null,
                    this.task_data.test_trials,
                    'test')
                timeline.push(this.general_instructions)
                timeline.push(this.Experiment.hide_progress_bar())
                timeline.push(this.pt_trials_instructions)
                timeline.push(pt_trials_timeline)
                timeline.push(this.test_trials_instructions)
                timeline.push(test_trials_timeline)
            }
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
            timeline.push(this.Experiment.trial_generators.get_task_feedback(this.prettyname))
            timeline.push(this.Experiment.trial_generators.remove_task_stylesheet("raven_matrix_task"))
            timeline.push(this.Experiment.trial_generators.exclusion_timeline(this.exclusion_criteria))
            timeline.push(this.Experiment.trial_generators.async_data_save(`${this.prettyname}__completed`))
        }
        return {timeline: timeline}
    }

    set_raven_content() {
        this.settings.STIMULI_LISTS = [
            {
                list_id: 1, 
                stimuli: ["B1_1", "C2_1", "D3_1", "E4_1", "A1B2", "A2C3", "A3D4", "A4E5", "B5C1", "B1D2", "B2E3", "C3D4", "C4E5", "D5E1", "X_1", "Y_1", "Z_1", "A3B1C2_1", "A2B4E1", "B1C5E2", "A1D3E2", "B2C1E4", "A3B4C1", "A3B2C5", "A4B1D3", "A4B2E5", "B5C3D1", "B5C2D4", "A2B3E4", "C3D5E1", "B2C4E3", "A2D4E5", "A3B4C5_1", "A3B5D4_1", "A4B3E5_1", "A4C5D3_1", "A3C4E5_1", "A3D5E4_1", "B3C4D5_1", "B3C5E4_1", "B4D3E5_1", "C4D5E3_1"]
            },
            {
                list_id: 2, 
                stimuli: ["B1_2", "C2_2", "D3_2", "E4_2", "A1B3", "A2C4", "A3D5", "A4E1", "B5C2", "B1D3", "B2E4", "C3D5", "C4E1", "D5E2", "X_2", "Y_2", "Z_2", "A4B2C1", "A1B5E2", "C3D2E1", "A2D4E1", "B1C2E5", "A3B5C2", "A4B1C3", "A4B2D5", "A3C1E4", "B5C4D2", "B3C1D4", "A1B3E5", "C4D3E2", "B1C4E5", "A1D5E3", "A3B5C4_1", "A4B3D5_1", "A4B5E3_1", "A3C4D5_1", "A3C5E4_1", "A4D3E5_1", "B3C5D4_1", "B4C3E5_1", "B4D5E3_1", "C5D3E4_1"]
            },
            {
                list_id: 3, 
                stimuli: ["B1_3", "C2_3", "D3_3", "E4_3", "A1B4", "A2C5", "A3D1", "A4E2", "B5C3", "B1D4", "B2E5", "C3D1", "C4E2", "D5E3", "X_3", "Y_3", "Z_3", "A3B1C2_2", "B3C2D1", "C4D1E2", "A1D5E2", "A2D1E3", "A4B3C1", "A4B2C5", "A3C1D4", "A3C2E5", "B3C4D1", "B3C2D5", "A2B4E3", "C4D5E1", "B1C5E3", "A2D5E4", "A4B3C5_1", "A4B5D3_1", "A3B4E5_1", "A3C5D4_1", "A4C3E5_1", "A4D5E3_1", "B4C3D5_1", "B4C5E3_1", "B5D3E4_1", "C5D4E3_1"]
            },
            {
                list_id: 4, 
                stimuli: ["B1_4", "C2_4", "D3_4", "E4_4", "A1B5", "A2C1", "A3D2", "A4E3", "B5C4", "B1D5", "B2E1", "C3D2", "C4E3", "D5E4", "X_4", "Y_4", "Z_4", "A3B2D1_1", "B4C1D2", "C5D2E1", "A2B1D3", "A1D2E4", "A4B5C2", "A3C4D1", "A3C2D5", "A3B1E4", "B3C5D2", "B4C1D3", "A1B4E5", "C5D3E2", "B1C5E4", "A1D3E4", "A4B5C3_1", "A3B4D5_1", "A3B5E4_1", "A4C3D5_1", "A4C5E3_1", "A3D4E5_1", "B4C5D3_1", "B5C3E4_1", "B5D4E3_1", "C3D4E5_1"]
            },
            {
                list_id: 5, 
                stimuli: ["A1_1", "B2_1", "C3_1", "D4_1", "E5_1", "D1E2", "A2B3", "A3C4", "A4D5", "B1C2", "B2D3", "B3E4", "C4D5", "C5E1", "X_5", "Y_5", "Z_5", "A4B1D2", "B5C2D1", "B1C3E2", "A1B2D4", "A2D1E5", "A3B4D1", "A3C5D2", "A3B1D4", "A3B2E5", "B4C3D1", "B4C2D5", "A2B5E3", "C5D4E1", "B2C3E4", "A2D3E5", "A3B4C5_2", "A3B5D4_2", "A4B3E5_2", "A4C5D3_2", "A3C4E5_2", "A3D5E4_2", "B5C3D4_1", "B5C4E3_1", "B3D4E5_1", "C3D5E4_1"]
            },
            {
                list_id: 6, 
                stimuli: ["A2_1", "B3_1", "C4_1", "D5_1", "E1_1", "D1E3", "A2B4", "A3C5", "A4D1", "B1C3", "B2D4", "B3E5", "C4D1", "C5E2", "X_6", "Y_6", "Z_6", "A3B2D1_2", "A1B3E2", "B1C4E2", "A2B1D5", "B1C2E3", "A3B5D2", "A3B1C4", "A3B2D5", "A4B1E3", "B4C5D2", "B5C1D3", "A1B5E4", "C3D4E2", "B2C3E5", "A1D4E3", "A3B5C4_2", "A4B3D5_2", "A4B5E3_2", "A3C4D5_2", "A3C5E4_2", "A4D3E5_2", "B5C4D3_1", "B3C4E5_1", "B3D5E4_1", "C4D3E5_1"]
            },
            {
                list_id: 7, 
                stimuli: ["A3_4", "B4_1", "C5_1", "D1_1", "E2_1", "D1E4", "A2B5", "A3C1", "A4D2", "B1C4", "B2D5", "B3E1", "C4D2", "C5E3", "X_7", "Y_7", "Z_7", "A3B1E2", "B4C2E1", "A2B1C5", "B1C2D3", "C2D1E4", "A3B4E1", "A3C5E2", "A4C1D3", "A4C2E5", "B5C3E1", "A1B5D4", "B3D2E4", "B1C3D5", "A1C4E3", "C2D4E5", "A4B3C5_2", "A4B5D3_2", "A3B4E5_2", "A3C5D4_2", "A4C3E5_2", "A4D5E3_2", "B3C4D5_2", "B3C5E4_2", "B4D3E5_2", "C4D5E3_2"]
            },
            {
                list_id: 8, 
                stimuli: ["A4_2", "B5_1", "C1_1", "D2_1", "E3_1", "D1E5", "A2B1", "A3C2", "A4D3", "B1C5", "B2D1", "B3E2", "C4D3", "C5E4", "X_8", "Y_8", "Z_8", "A4B2E1_1", "B5C1E2", "A1C3D2", "B2C1D4", "C1D2E5", "A3B5E2", "A4C3D1", "A4C2D5", "A4D1E3", "B5C4E2", "A2B3D4", "B3D1E5", "B2C4D3", "A2C4E5", "C1D5E3", "A4B5C3_2", "A3B4D5_2", "A3B5E4_2", "A4C3D5_2", "A4C5E3_2", "A3D4E5_2", "B3C5D4_2", "B4C3E5_2", "B4D5E3_2", "C5D3E4_2"]
            },
            // this list is not used as B2_2 is not shared in the repository by Matzen et al 2010
            // {
            //     list_id: 9, 
            //     stimuli: ["A1_4", "B2_2", "C3_2", "D4_2", "E5_2", "C1E2", "D2E3", "A3B4", "A4C5", "A1E2", "B2C3", "B3D4", "B4E5", "C5D1", "X_9", "Y_9", "Z_9", "A4B2E1_2", "B3D2E1", "A2C4D1", "B1C2D5", "B2D1E3", "A4B3D1", "A4C5D2", "A4D3E1", "A4D2E3", "B3C4E1", "A1B3D5", "B4D2E3", "B1C4D5", "A1C5E3", "C2D5E4", "A3B4C5_3", "A3B5D4_3", "A4B3E5_3", "A4C5D3_3", "A3C4E5_3", "A3D5E4_3", "B4C3D5_2", "B4C5E3_2", "B5D3E4_2", "C5D4E3_2"]
            // },
            {
                list_id: 10, 
                stimuli: ["A2_2", "B3_2", "C4_2", "D5_2", "E1_2", "C1E3", "D2E4", "A3B5", "A4C1", "A1E3", "B2C4", "B3D5", "B4E1", "C5D2", "X_10", "Y_10", "Z_10", "A3C2D1", "B4D1E2", "A1C5D2", "A2C1D3", "B1D2E4", "A4B5D2", "A4C3E1", "A4D3E2", "A3D1E4", "B3C5E2", "A2B4D3", "B4D1E5", "B2C5D3", "A2C5E4", "C1D3E4", "A3B5C4_3", "A4B3D5_3", "A4B5E3_3", "A3C4D5_3", "A3C5E4_3", "A4D3E5_3", "B4C5D3_2", "B5C3E4_2", "B5D4E3_2", "C3D4E5_2"]
            },
            {
                list_id: 11, 
                stimuli: ["A3_2", "B4_2", "C5_2", "D1_2", "E2_2", "C1E4", "D2E5", "A3B1", "A4C2", "A1E4", "B2C5", "B3D1", "B4E2", "C5D3", "X_11", "Y_11", "Z_11", "A4C1D2_1", "B5D2E1", "A2B1C3", "A1C2D4", "B2D1E5", "A4B3E1", "A4C5E2", "A3D4E1", "A3D2E5", "B4C3E1", "A1B4D5", "B5D2E3", "B1C5D4", "A1C3E4", "C2D3E5", "A4B3C5_3", "A4B5D3_3", "A3B4E5_3", "A3C5D4_3", "A4C3E5_3", "A4D5E3_3", "B5C3D4_2", "B5C4E3_2", "B3D4E5_2", "C3D5E4_2"]
            },
            {
                list_id: 12, 
                stimuli: ["A4_3", "B5_2", "C1_2", "D2_2", "E3_2", "C1E5", "D2E1", "A3B2", "A4C3", "A1E5", "B2C1", "B3D2", "B4E3", "C5D4", "X_12", "Y_12", "Z_12", "A4C1D2_2", "B3C1E2", "A1B2C4", "A2C1D5", "C1D2E3", "A4B5E2", "A3C4E1", "A3D5E2", "A4C1E3", "B4C5E2", "A2B5D3", "B5D1E4", "B2C3D4", "A2C3E5", "C1D4E3", "A4B5C3_3", "A3B4D5_3", "A3B5E4_3", "A4C3D5_3", "A4C5E3_3", "A3D4E5_3", "B5C4D3_2", "B3C4E5_2", "B3D5E4_2", "C4D3E5_2"]
            },
            {
                list_id: 13, 
                stimuli: ["A1_2", "B2_3", "C3_3", "D4_3", "E5_3", "C1D2", "C2E3", "D3E4", "A4B5", "A1D2", "A2E3", "B3C4", "B4D5", "B5E1", "X_13", "Y_13", "Z_13", "A3C1E2_1", "A1B4C2", "A2C5E1", "C1D3E2", "A1C2E4", "A3B4C2", "A3B1C5", "A4B2D3", "A4B1E5", "A2B5C3", "B5D4E1", "B3C2E4", "A2C3D5", "C4D1E3", "B1D4E5", "A3B4C5_4", "A3B5D4_4", "A4B3E5_4", "A4C5D3_4", "A3C4E5_4", "A3D5E4_4", "B3C4D5_3", "B3C5E4_3", "B4D3E5_3", "C4D5E3_3"]
            },
            {
                list_id: 14, 
                stimuli: ["A2_3", "B3_3", "C4_3", "D5_3", "E1_3", "C1D3", "C2E4", "D3E5", "A4B1", "A1D3", "A2E4", "B3C5", "B4D1", "B5E2", "X_14", "Y_14", "Z_14", "A4C2E1", "A2B5C1", "B1C3D2", "C2D4E1", "A2C1E5", "A3B5C1", "A4B2C3", "A4B1D5", "A3C2E4", "A1B5C4", "B3D4E2", "B3C1E5", "A1C4D3", "C4D2E5", "B1D5E3", "A3B5C4_4", "A4B3D5_4", "A4B5E3_4", "A3C4D5_4", "A3C5E4_4", "A4D3E5_4", "B3C5D4_3", "B4C3E5_3", "B4D5E3_3", "C5D3E4_3"]
            },
            {
                list_id: 15, 
                stimuli: ["A3_1", "B4_3", "C5_3", "D1_3", "E2_3", "C1D4", "C2E5", "D3E1", "A4B2", "A1D4", "A2E5", "B3C1", "B4D2", "B5E3", "X_15", "Y_15", "Z_15", "A3C1E2_2", "A1B3D2", "B2C4D1", "C1D5E2", "A1B2E3", "A4B3C2", "A4B1C5", "A3C2D4", "A3C1E5", "A2B3C4", "B3D5E1", "B4C2E3", "A2C4D5", "C5D1E3", "B2D5E4", "A4B3C5_4", "A4B5D3_4", "A3B4E5_4", "A3C5D4_4", "A4C3E5_4", "A4D5E3_4", "B4C3D5_3", "B4C5E3_3", "B5D3E4_3", "C5D4E3_3"]
            },
            {
                list_id: 16, 
                stimuli: ["A4_1", "B5_3", "C1_3", "D2_3", "E3_3", "C1D5", "C2E1", "D3E2", "A4B3", "A1D5", "A2E1", "B3C2", "B4D3", "B5E4", "X_16", "Y_16", "Z_16", "A3D2E1", "A2B4D1", "B1C5D2", "B2D3E1", "A2B1E4", "A4B5C1", "A3C4D2", "A3C1D5", "A3D2E4", "A1B3C5", "B4D3E2", "B4C1E5", "A1C5D3", "C5D2E4", "B1D3E4", "A4B5C3_4", "A3B4D5_4", "A3B5E4_4", "A4C3D5_4", "A4C5E3_4", "A3D4E5_4", "B4C5D3_3", "B5C3E4_3", "B5D4E3_3", "C3D4E5_3"]
            },
            {
                list_id: 17, 
                stimuli: ["A1_3", "B2_4", "C3_4", "D4_4", "E5_4", "B1E2", "C2D3", "C3E4", "D4E5", "A1C2", "A2D3", "A3E4", "B4C5", "B5D1", "X_17", "Y_17", "Z_17", "A4D1E2_1", "A1B5D2", "A2C3E1", "B1D4E2", "A1B2E5", "A3B4D2", "A3C5D1", "A3B2D4", "A3B1E5", "A2B4C3", "B4D5E1", "B5C2E3", "A2C5D4", "C3D1E4", "B2D3E5", "A3B4C5_5", "A3B5D4_5", "A4B3E5_5", "A4C5D3_5", "A3C4E5_5", "A3D5E4_5", "B5C3D4_3", "B5C4E3_3", "B3D4E5_3", "C3D5E4_3"]
            },
            {
                list_id: 18, 
                stimuli: ["A2_4", "B3_4", "C4_4", "D5_4", "E1_4", "B1E3", "C2D4", "C3E5", "D4E1", "A1C3", "A2D4", "A3E5", "B4C1", "B5D2", "X_18", "Y_18", "Z_18", "A4D1E2_2", "A2B3C1", "A1C4E2", "B2D5E1", "A2C1E3", "A3B5D1", "A3B2C4", "A3B1D5", "A4B2E3", "A1B4C5", "B5D3E2", "B5C1E4", "A1C3D4", "C3D2E5", "B1D4E3", "A3B5C4_5", "A4B3D5_5", "A4B5E3_5", "A3C4D5_5", "A3C5E4_5", "A4D3E5_5", "B5C4D3_3", "B3C4E5_3", "B3D5E4_3", "C4D3E5_3"]
            },
            {
                list_id: 19, 
                stimuli: ["A3_3", "B4_4", "C5_4", "D1_4", "E2_4", "B1E4", "C2D5", "C3E1", "D4E2", "A1C4", "A2D5", "A3E1", "B4C2", "B5D3", "X_19", "Y_19", "Z_19", "A3B2C1", "A1B4E2", "B2C5E1", "A2D3E1", "B1C2E4", "A3B4E2", "A3C5E1", "A4C2D3", "A4D1E5", "B5C3D2", "B5C1D4", "A1B3E4", "C3D5E2", "B1C4E3", "A1D4E5", "A4B3C5_5", "A4B5D3_5", "A3B4E5_5", "A3C5D4_5", "A4C3E5_5", "A4D5E3_5", "B3C4D5_4", "B3C5E4_4", "B4D3E5_4", "C4D5E3_4"]
            },
            {
                list_id: 20, 
                stimuli: ["A4_1", "B5_4", "C1_4", "D2_4", "E3_4", "B1E5", "C2D1", "C3E2", "D4E3", "A1C5", "A2D1", "A3E2", "B4C3", "B5D4", "X_20", "Y_20", "Z_20", "A4B1C2", "A2B5E1", "C3D1E2", "A1D4E2", "B2C1E5", "A3B5E1", "A4C3D2", "A4D5E1", "A4D2E5", "B5C4D1", "B3C2D4", "A2B3E5", "C4D3E1", "B2C4E5", "A2D5E3", "A4B5C3_5", "A3B4D5_5", "A3B5E4_5", "A4C3D5_5", "A4C5E3_5", "A3D4E5_5", "B3C5D4_4", "B4C3E5_4", "B4D5E3_4", "C5D3E4_4"]
            },
        ]

        this.settings.CORRECT_ANSWERS = {"A1_1": 6,"A1_2": 3,"A1_3": 7,"A1_4": 1,"A2_1": 5,"A2_2": 4,"A2_3": 1,"A2_4": 4,"A3_1": 3,"A3_2": 7,"A3_3": 6,"A3_4": 4,"A4_1": 2,"A4_2": 1,"A4_3": 3,"A4_4": 1,"B1_1": 3,"B1_2": 2,"B1_3": 8,"B1_4": 6,"B2_1": 8,"B2_3": 1,"B2_4": 2,"B3_1": 7,"B3_2": 1,"B3_3": 3,"B3_4": 7,"B4_1": 4,"B4_2": 4,"B4_3": 1,"B4_4": 4,"B5_1": 4,"B5_2": 7,"B5_3": 3,"B5_4": 6,"C1_1": 5,"C1_2": 4,"C1_3": 1,"C1_4": 4,"C2_1": 5,"C2_2": 3,"C2_3": 2,"C2_4": 8,"C3_1": 7,"C3_2": 4,"C3_3": 7,"C3_4": 3,"C4_1": 8,"C4_2": 3,"C4_3": 1,"C4_4": 2,"C5_1": 7,"C5_2": 1,"C5_3": 3,"C5_4": 7,"D1_1": 8,"D1_2": 3,"D1_3": 1,"D1_4": 2,"D2_1": 7,"D2_2": 1,"D2_3": 3,"D2_4": 7,"D3_1": 7,"D3_2": 5,"D3_3": 3,"D3_4": 2,"D4_1": 8,"D4_2": 5,"D4_3": 4,"D4_4": 1,"D5_1": 6,"D5_2": 4,"D5_3": 7,"D5_4": 3,"E1_1": 8,"E1_2": 5,"E1_3": 4,"E1_4": 1,"E2_1": 6,"E2_2": 4,"E2_3": 7,"E2_4": 3,"E3_1": 8,"E3_2": 3,"E3_3": 1,"E3_4": 2,"E4_1": 8,"E4_2": 7,"E4_3": 5,"E4_4": 3,"E5_1": 2,"E5_2": 7,"E5_3": 1,"E5_4": 3,"A1B2": 5,"A1B3": 8,"A1B4": 7,"A1B5": 5,"A2B1": 8,"A2B3": 5,"A2B4": 3,"A2B5": 2,"A3B1": 8,"A3B2": 7,"A3B4": 8,"A3B5": 6,"A4B1": 5,"A4B2": 4,"A4B3": 3,"A4B5": 7,"A1C2": 4,"A1C3": 3,"A1C4": 1,"A1C5": 4,"A2C1": 7,"A2C3": 7,"A2C4": 2,"A2C5": 8,"A3C1": 3,"A3C2": 2,"A3C4": 7,"A3C5": 5,"A4C1": 8,"A4C2": 6,"A4C3": 8,"A4C5": 2,"A1D2": 6,"A1D3": 8,"A1D4": 7,"A1D5": 5,"A2D1": 1,"A2D3": 5,"A2D4": 4,"A2D5": 3,"A3D1": 2,"A3D2": 8,"A3D4": 2,"A3D5": 4,"A4D1": 7,"A4D2": 5,"A4D3": 3,"A4D5": 5,"A1E2": 5,"A1E3": 3,"A1E4": 2,"A1E5": 8,"A2E1": 7,"A2E3": 8,"A2E4": 6,"A2E5": 8,"A3E1": 4,"A3E2": 3,"A3E4": 7,"A3E5": 5,"A4E1": 5,"A4E2": 4,"A4E3": 2,"A4E5": 8,"B1C2": 4,"B1C3": 2,"B1C4": 8,"B1C5": 7,"B2C1": 2,"B2C3": 7,"B2C4": 5,"B2C5": 3,"B3C1": 6,"B3C2": 8,"B3C4": 2,"B3C5": 8,"B4C1": 7,"B4C2": 5,"B4C3": 4,"B4C5": 8,"B5C1": 5,"B5C2": 8,"B5C3": 5,"B5C4": 4,"B1D2": 4,"B1D3": 5,"B1D4": 8,"B1D5": 5,"B2D1": 8,"B2D3": 5,"B2D4": 4,"B2D5": 2,"B3D1": 5,"B3D2": 3,"B3D4": 8,"B3D5": 7,"B4D1": 2,"B4D2": 8,"B4D3": 6,"B4D5": 3,"B5D1": 6,"B5D2": 8,"B5D3": 7,"B5D4": 5,"B1E2": 1,"B1E3": 3,"B1E4": 1,"B1E5": 3,"B2E1": 8,"B2E3": 8,"B2E4": 4,"B2E5": 5,"B3E1": 4,"B3E2": 2,"B3E4": 8,"B3E5": 5,"B4E1": 8,"B4E2": 7,"B4E3": 5,"B4E5": 2,"B5E1": 5,"B5E2": 3,"B5E3": 2,"B5E4": 8,"C1D2": 3,"C1D3": 1,"C1D4": 4,"C1D5": 7,"C2D1": 1,"C2D3": 7,"C2D4": 1,"C2D5": 3,"C3D1": 4,"C3D2": 5,"C3D4": 2,"C3D5": 8,"C4D1": 8,"C4D2": 5,"C4D3": 4,"C4D5": 5,"C5D1": 4,"C5D2": 2,"C5D3": 8,"C5D4": 7,"C1E2": 7,"C1E3": 7,"C1E4": 5,"C1E5": 4,"C2E1": 4,"C2E3": 4,"C2E4": 3,"C2E5": 1,"C3E1": 3,"C3E2": 3,"C3E4": 4,"C3E5": 7,"C4E1": 2,"C4E2": 8,"C4E3": 4,"C4E5": 7,"C5E1": 4,"C5E2": 5,"C5E3": 8,"C5E4": 5,"D1E2": 3,"D1E3": 2,"D1E4": 8,"D1E5": 6,"D2E1": 5,"D2E3": 6,"D2E4": 8,"D2E5": 7,"D3E1": 3,"D3E2": 1,"D3E4": 5,"D3E5": 4,"D4E1": 4,"D4E2": 7,"D4E3": 1,"D4E5": 1,"D5E1": 5,"D5E2": 7,"D5E3": 2,"D5E4": 8,"A3B1C2_1": 4,"A3B1C2_2": 8,"A3B1E2": 6,"A3B2C1": 8,"A3B2D1_1": 2,"A3B2D1_2": 7,"A3C1E2_1": 4,"A3C1E2_2": 8,"A3C2D1": 7,"A3D2E1": 5,"A4B1C2": 7,"A4B1D2": 3,"A4B2C1": 1,"A4B2E1_1": 5,"A4B2E1_2": 5,"A4C1D2_1": 2,"A4C1D2_2": 8,"A4C2E1": 5,"A4D1E2_1": 4,"A4D1E2_2": 2,"A1B3D2": 5,"A1B3E2": 3,"A1B4C2": 8,"A1B4E2": 2,"A1B5D2": 5,"A1B5E2": 4,"A2B3C1": 4,"A2B4D1": 8,"A2B4E1": 3,"A2B5C1": 4,"A2B5E1": 8,"B3C1E2": 2,"B3C2D1": 1,"B3D2E1": 5,"B4C1D2": 8,"B4C2E1": 7,"B4D1E2": 5,"B5C1E2": 6,"B5C2D1": 2,"B5D2E1": 7,"A1B2C4": 7,"A1C3D2": 7,"A1C4E2": 5,"A1C5D2": 5,"A2B1C3": 5,"A2B1C5": 3,"A2C3E1": 8,"A2C4D1": 6,"A2C5E1": 2,"B1C3D2": 8,"B1C3E2": 8,"B1C4E2": 2,"B1C5D2": 5,"B1C5E2": 6,"B2C4D1": 4,"B2C5E1": 4,"C3D1E2": 2,"C3D2E1": 3,"C4D1E2": 4,"C5D2E1": 1,"A1B2D4": 1,"A1C2D4": 5,"A1D3E2": 1,"A1D4E2": 4,"A1D5E2": 3,"A2B1D3": 4,"A2B1D5": 8,"A2C1D3": 6,"A2C1D5": 5,"A2D3E1": 5,"A2D4E1": 6,"B1C2D3": 2,"B1C2D5": 8,"B1D4E2": 5,"B2C1D4": 3,"B2D3E1": 4,"B2D5E1": 8,"C1D3E2": 7,"C1D5E2": 8,"C2D4E1": 2,"A1B2E3": 2,"A1B2E5": 4,"A1C2E4": 5,"A1D2E4": 3,"A2B1E4": 8,"A2C1E3": 5,"A2C1E5": 7,"A2D1E3": 6,"A2D1E5": 4,"B1C2E3": 1,"B1C2E4": 8,"B1C2E5": 1,"B1D2E4": 7,"B2C1E4": 6,"B2C1E5": 5,"B2D1E3": 3,"B2D1E5": 6,"C1D2E3": 5,"C1D2E5": 2,"C2D1E4": 8,"A3B4C1": 6,"A3B4C2": 5,"A3B4D1": 3,"A3B4D2": 8,"A3B4E1": 1,"A3B4E2": 5,"A3B5C1": 5,"A3B5C2": 6,"A3B5D1": 4,"A3B5D2": 4,"A3B5E1": 8,"A3B5E2": 8,"A4B3C1": 1,"A4B3C2": 7,"A4B3D1": 2,"A4B3E1": 7,"A4B5C1": 2,"A4B5C2": 6,"A4B5D2": 3,"A4B5E2": 6,"A3B1C4": 3,"A3B1C5": 6,"A3B2C4": 8,"A3B2C5": 2,"A3C4D1": 1,"A3C4D2": 7,"A3C4E1": 7,"A3C5D1": 2,"A3C5D2": 6,"A3C5E1": 4,"A3C5E2": 4,"A4B1C3": 6,"A4B1C5": 5,"A4B2C3": 5,"A4B2C5": 6,"A4C3D1": 1,"A4C3D2": 5,"A4C3E1": 2,"A4C5D2": 8,"A4C5E2": 3,"A3B1D4": 1,"A3B1D5": 2,"A3B2D4": 7,"A3B2D5": 6,"A3C1D4": 6,"A3C1D5": 5,"A3C2D4": 5,"A3C2D5": 6,"A3D4E1": 2,"A3D5E2": 3,"A4B1D3": 1,"A4B1D5": 6,"A4B2D3": 7,"A4B2D5": 2,"A4C1D3": 3,"A4C2D3": 8,"A4C2D5": 4,"A4D3E1": 1,"A4D3E2": 8,"A4D5E1": 4,"A3B1E4": 6,"A3B1E5": 5,"A3B2E5": 6,"A3C1E4": 1,"A3C1E5": 6,"A3C2E4": 7,"A3C2E5": 2,"A3D1E4": 1,"A3D2E4": 5,"A3D2E5": 8,"A4B1E3": 1,"A4B1E5": 3,"A4B2E3": 7,"A4B2E5": 6,"A4C1E3": 2,"A4C2E5": 6,"A4D1E3": 3,"A4D1E5": 2,"A4D2E3": 4,"A4D2E5": 8,"A1B3C5": 6,"A1B4C5": 5,"A1B5C4": 3,"A2B3C4": 7,"A2B4C3": 5,"A2B5C3": 2,"B3C4D1": 1,"B3C4E1": 3,"B3C5D2": 2,"B3C5E2": 4,"B4C3D1": 6,"B4C3E1": 1,"B4C5D2": 6,"B4C5E2": 8,"B5C3D1": 4,"B5C3D2": 7,"B5C3E1": 1,"B5C4D1": 2,"B5C4D2": 6,"B5C4E2": 6,"A1B3D5": 6,"A1B4D5": 4,"A1B5D4": 6,"A2B3D4": 1,"A2B4D3": 3,"A2B5D3": 1,"B3C1D4": 4,"B3C2D4": 7,"B3C2D5": 6,"B3D4E2": 2,"B3D5E1": 3,"B4C1D3": 1,"B4C2D5": 2,"B4D3E2": 7,"B4D5E1": 6,"B5C1D3": 6,"B5C1D4": 5,"B5C2D4": 7,"B5D3E2": 5,"B5D4E1": 8,"A1B3E4": 5,"A1B3E5": 7,"A1B4E5": 6,"A1B5E4": 2,"A2B3E4": 2,"A2B3E5": 5,"A2B4E3": 4,"A2B5E3": 1,"B3C1E5": 8,"B3C2E4": 1,"B3D1E5": 6,"B3D2E4": 6,"B4C1E5": 3,"B4C2E3": 2,"B4D1E5": 6,"B4D2E3": 1,"B5C1E4": 6,"B5C2E3": 7,"B5D1E4": 4,"B5D2E3": 3,"A1C3D4": 7,"A1C4D3": 1,"A1C5D3": 2,"A2C3D5": 4,"A2C4D5": 8,"A2C5D4": 3,"B1C3D5": 2,"B1C4D5": 6,"B1C5D4": 6,"B2C3D4": 3,"B2C4D3": 6,"B2C5D3": 1,"C3D4E2": 1,"C3D5E1": 3,"C3D5E2": 6,"C4D3E1": 5,"C4D3E2": 2,"C4D5E1": 7,"C5D3E2": 4,"C5D4E1": 6,"A1C3E4": 1,"A1C4E3": 1,"A1C5E3": 6,"A2C3E5": 6,"A2C4E5": 2,"A2C5E4": 6,"B1C4E3": 7,"B1C4E5": 3,"B1C5E3": 2,"B1C5E4": 7,"B2C3E4": 4,"B2C3E5": 6,"B2C4E3": 1,"B2C4E5": 6,"C3D1E4": 2,"C3D2E5": 3,"C4D1E3": 3,"C4D2E5": 4,"C5D1E3": 1,"C5D2E4": 8,"A1D3E4": 2,"A1D4E3": 4,"A1D4E5": 3,"A1D5E3": 1,"A2D3E5": 7,"A2D4E5": 3,"A2D5E3": 7,"A2D5E4": 3,"B1D3E4": 1,"B1D4E3": 2,"B1D4E5": 6,"B1D5E3": 3,"B2D3E5": 8,"B2D5E4": 4,"C1D3E4": 6,"C1D4E3": 1,"C1D5E3": 1,"C2D3E5": 6,"C2D4E5": 6,"C2D5E4": 2,"A3B4C5_1": 1,"A3B4C5_2": 2,"A3B4C5_3": 1,"A3B4C5_4": 1,"A3B4C5_5": 1,"A3B5C4_1": 3,"A3B5C4_2": 7,"A3B5C4_3": 2,"A3B5C4_4": 6,"A3B5C4_5": 8,"A4B3C5_1": 1,"A4B3C5_2": 4,"A4B3C5_3": 6,"A4B3C5_4": 3,"A4B3C5_5": 2,"A4B5C3_1": 3,"A4B5C3_2": 6,"A4B5C3_3": 6,"A4B5C3_4": 4,"A4B5C3_5": 3,"A3B4D5_1": 1,"A3B4D5_2": 4,"A3B4D5_3": 6,"A3B4D5_4": 3,"A3B4D5_5": 2,"A3B5D4_1": 7,"A3B5D4_2": 3,"A3B5D4_3": 6,"A3B5D4_4": 6,"A3B5D4_5": 4,"A4B3D5_1": 1,"A4B3D5_2": 2,"A4B3D5_3": 1,"A4B3D5_4": 1,"A4B3D5_5": 1,"A4B5D3_1": 3,"A4B5D3_2": 7,"A4B5D3_3": 2,"A4B5D3_4": 6,"A4B5D3_5": 8,"A3B4E5_1": 1,"A3B4E5_2": 2,"A3B4E5_3": 1,"A3B4E5_4": 1,"A3B4E5_5": 1,"A3B5E4_1": 3,"A3B5E4_2": 7,"A3B5E4_3": 2,"A3B5E4_4": 6,"A3B5E4_5": 3,"A4B3E5_1": 4,"A4B3E5_2": 1,"A4B3E5_3": 4,"A4B3E5_4": 6,"A4B3E5_5": 3,"A4B5E3_1": 7,"A4B5E3_2": 3,"A4B5E3_3": 6,"A4B5E3_4": 6,"A4B5E3_5": 4,"A3C4D5_1": 4,"A3C4D5_2": 1,"A3C4D5_3": 4,"A3C4D5_4": 6,"A3C4D5_5": 3,"A3C5D4_1": 7,"A3C5D4_2": 3,"A3C5D4_3": 6,"A3C5D4_4": 6,"A3C5D4_5": 4,"A4C3D5_1": 1,"A4C3D5_2": 2,"A4C3D5_3": 1,"A4C3D5_4": 1,"A4C3D5_5": 1,"A4C5D3_1": 1,"A4C5D3_2": 3,"A4C5D3_3": 7,"A4C5D3_4": 2,"A4C5D3_5": 6,"A3C4E5_1": 3,"A3C4E5_2": 1,"A3C4E5_3": 2,"A3C4E5_4": 1,"A3C4E5_5": 1,"A3C5E4_1": 1,"A3C5E4_2": 3,"A3C5E4_3": 7,"A3C5E4_4": 2,"A3C5E4_5": 6,"A4C3E5_1": 4,"A4C3E5_2": 1,"A4C3E5_3": 4,"A4C3E5_4": 6,"A4C3E5_5": 3,"A4C5E3_1": 7,"A4C5E3_2": 3,"A4C5E3_3": 6,"A4C5E3_4": 6,"A4C5E3_5": 4,"A3D4E5_1": 4,"A3D4E5_2": 1,"A3D4E5_3": 4,"A3D4E5_4": 6,"A3D4E5_5": 3,"A3D5E4_1": 4,"A3D5E4_2": 7,"A3D5E4_3": 3,"A3D5E4_4": 6,"A3D5E4_5": 6,"A4D3E5_1": 3,"A4D3E5_2": 1,"A4D3E5_3": 2,"A4D3E5_4": 1,"A4D3E5_5": 1,"A4D5E3_1": 1,"A4D5E3_2": 3,"A4D5E3_3": 7,"A4D5E3_4": 2,"A4D5E3_5": 6,"B3C4D5_1": 5,"B3C4D5_2": 1,"B3C4D5_3": 4,"B3C4D5_4": 1,"B3C5D4_1": 4,"B3C5D4_2": 3,"B3C5D4_3": 6,"B3C5D4_4": 6,"B4C3D5_1": 3,"B4C3D5_2": 1,"B4C3D5_3": 1,"B4C5D3_1": 1,"B4C5D3_2": 3,"B4C5D3_3": 2,"B5C3D4_1": 4,"B5C3D4_2": 2,"B5C3D4_3": 6,"B5C4D3_1": 7,"B5C4D3_2": 7,"B5C4D3_3": 6,"B3C4E5_1": 4,"B3C4E5_2": 2,"B3C4E5_3": 6,"B3C5E4_1": 7,"B3C5E4_2": 7,"B3C5E4_3": 7,"B3C5E4_4": 6,"B4C3E5_1": 5,"B4C3E5_2": 1,"B4C3E5_3": 4,"B4C3E5_4": 1,"B4C5E3_1": 4,"B4C5E3_2": 3,"B4C5E3_3": 6,"B5C3E4_1": 3,"B5C3E4_2": 1,"B5C3E4_3": 1,"B5C4E3_1": 1,"B5C4E3_2": 3,"B5C4E3_3": 2,"B3D4E5_1": 3,"B3D4E5_2": 1,"B3D4E5_3": 1,"B3D5E4_1": 1,"B3D5E4_2": 3,"B3D5E4_3": 2,"B4D3E5_1": 8,"B4D3E5_2": 4,"B4D3E5_3": 2,"B4D3E5_4": 6,"B4D5E3_1": 7,"B4D5E3_2": 7,"B4D5E3_3": 7,"B4D5E3_4": 6,"B5D3E4_1": 5,"B5D3E4_2": 1,"B5D3E4_3": 4,"B5D4E3_1": 4,"B5D4E3_2": 3,"B5D4E3_3": 6,"C3D4E5_1": 5,"C3D4E5_2": 1,"C3D4E5_3": 4,"C3D5E4_1": 4,"C3D5E4_2": 3,"C3D5E4_3": 6,"C4D3E5_1": 3,"C4D3E5_2": 1,"C4D3E5_3": 1,"C4D5E3_1": 6,"C4D5E3_2": 1,"C4D5E3_3": 3,"C4D5E3_4": 2,"C5D3E4_1": 8,"C5D3E4_2": 4,"C5D3E4_3": 2,"C5D3E4_4": 6,"C5D4E3_1": 7,"C5D4E3_2": 7,"C5D4E3_3": 7,"X_1": 5,"X_2": 5,"X_3": 7,"X_4": 2,"X_5": 8,"X_6": 4,"X_7": 5,"X_8": 8,"X_9": 5,"X_10": 4,"X_11": 2,"X_12": 8,"X_13": 7,"X_14": 5,"X_15": 3,"X_16": 2,"X_17": 8,"X_18": 6,"X_19": 8,"X_20": 7,"Y_1": 6,"Y_2": 5,"Y_3": 5,"Y_4": 7,"Y_5": 2,"Y_6": 8,"Y_7": 4,"Y_8": 5,"Y_9": 8,"Y_10": 5,"Y_11": 4,"Y_12": 2,"Y_13": 8,"Y_14": 7,"Y_15": 5,"Y_16": 3,"Y_17": 2,"Y_18": 8,"Y_19": 6,"Y_20": 8,"Z_1": 7,"Z_2": 6,"Z_3": 5,"Z_4": 5,"Z_5": 7,"Z_6": 2,"Z_7": 8,"Z_8": 4,"Z_9": 5,"Z_10": 8,"Z_11": 5,"Z_12": 4,"Z_13": 2,"Z_14": 8,"Z_15": 7,"Z_16": 5,"Z_17": 3,"Z_18": 2,"Z_19": 8,"Z_20": 6}
    }
}