import { save_session_restart_info, save_data_json, save_data_backup } from './save_data_json.js';

export class Experiment {
    constructor(jsPsych, task_query_string) {
        this.jsPsych = jsPsych;

        this.helper_funcs = this.get_helper_funcs();
        this.modifiable_settings = this.get_modifiable_settings();
        this.default_settings = this.get_default_settings();
        this.settings = this.get_updated_settings_from_query(task_query_string);

        this.session_info = this.get_session_info()
        this.saved_progress = {
            task_order_indices: {},
            data_checkpoints: []
        }

        if (this.settings.TEST_EXCLUSION_CRITERIA) {this.settings.SKIP_INTRO_TRIALS = true};
        this.trial_generators = this.get_trial_generators();
        this.timeline = [];
    }

    get_modifiable_settings() {
        let modifiable_settings = [
            {
                variable: 'INSTRUCTIONS_ONLY',
                query_shortcode: 'io',
                prettyname: 'Instructions trials only (with signposts)',
                input_type: 'checkbox'
            },
            {
                variable: 'IGNORE_VALIDATION',
                query_shortcode: 'iv',
                prettyname: 'Ignore response validation',
                input_type: 'checkbox'
            },
            {
                variable: 'SKIP_INTRO_TRIALS',
                query_shortcode: 'sit',
                prettyname: 'Skip experiment intro trials (consent, browser check, fullscreen)',
                input_type: 'checkbox'
            },
            {
                variable: 'TEST_EXCLUSION_CRITERIA',
                query_shortcode: 'tec',
                prettyname: 'Test exclusion criteria (will show a message after the first task\'s instructions).',
                input_type: 'checkbox'
            },
            {
                variable: 'SIMULATE',
                query_shortcode: 'sim',
                prettyname: 'Simulate human input programatically',
                input_type: 'checkbox'
            },
            {
                variable: 'SIMULATE_TRIAL_DURATION',
                query_shortcode: 'simtd',
                prettyname: 'Time per trial in simulate mode',
                input_type: 'number'
            },
            {
                variable: 'FORM',
                query_shortcode: 'frm',
                prettyname: 'Form (1=33ff78, 2=223301)',
                input_type: 'select',
                input_options: [
                    {value: "223301", label: "2"},
                    {value: "33ff78", label: "1"}
                ]
            }
        ]
        return modifiable_settings
    }

    get_default_settings() {
        const settings = {
            INSTRUCTIONS_ONLY: false,
            IGNORE_VALIDATION: false,
            SKIP_INTRO_TRIALS: false,
            TEST_EXCLUSION_CRITERIA: false,
            SIMULATE: false,
            SIMULATE_TRIAL_DURATION: 250,
            FORM: ["223301", "33ff78"][Math.floor(Math.random() * 2)]
        }
        return settings;
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
                settings[curr_setting_obj.variable] = this.helper_funcs.string_to_type(query_arr[i+1], task_setting_type)
            }
        }
        return settings
    }

    get_session_info() {
        const self = this
        function get_subject_id() {
            let subject_id
    
            const quorumId = new URLSearchParams(window.location.search).get('quorumId')
            if (quorumId !== null) {
                subject_id = `Q_${quorumId}`
            } else {
                let cached_subject_id = localStorage.getItem("subject_id")
                if (/^R_\d{7}$/.test(cached_subject_id)) {
                    subject_id = cached_subject_id
                } else {
                    subject_id = `R_${self.jsPsych.randomization.randomInt(1000000, 9999999)}`
                    localStorage.setItem("subject_id", subject_id)
                }
            }

            return subject_id
        }

        let session_info = {}
        session_info.subject_id = get_subject_id()
        session_info.form =  self.settings.FORM // this was picked up from the URL
        session_info.wave = ["3", "5"][Math.floor(Math.random() * 2)]; // this was picked up from the URL
        // session_info.group = new URLSearchParams(window.location.search).get('group')
        if (session_info.subject_id.startsWith("R_") && session_info.form === null) {
            session_info.form = "all"
        }
        return session_info
    }

    get_helper_funcs() {
        let helper_funcs = {}
        helper_funcs.format_ind_to_key = function(ind, type) {
                let key
                if (ind < 10) {
                    key = `${type}_00${ind}`
                } else if (ind >= 10 && ind < 100) {
                    key = `${type}_0${ind}`
                } else {
                    key = `${type}_${ind}`
                }
                return key
            }
        helper_funcs.get_task_trials_timeline_with_interblock_text = function(single_trial_order, blocks, interblock_text_trial = null, task_data, pt_or_test_timeline) {
            // essentially adding inter-block text
            // as task_data provide either test_trials or pt_trials
            const trials_timeline = []
            for (let block_ind=0; block_ind<blocks; block_ind++) {
                const curr_block_timeline = {
                    timeline: single_trial_order,
                    // timeline_vars is an array of objects, where key-values pairs are var name-var value
                    timeline_variables: Object.values(task_data[helper_funcs.format_ind_to_key(block_ind, 'block')])
                }
                trials_timeline.push(curr_block_timeline)
                if (block_ind+1 !== blocks && interblock_text_trial !== null) {
                    // making sure we dont show the text at the very end
                    // Note that timeline_variables are always arrays
                    trials_timeline.push({timeline: [interblock_text_trial],
                                                        timeline_variables: [{'curr_block_ind': block_ind+1, 'pavlovia_save_checkpoint': `main ${pt_or_test_timeline} trials -- finished block ${block_ind}`}]})
                }
            }
            // NB: test_trials_timeline is an array of timelines; to export and then add it successfully, it needs to be a timeline object
            return {timeline: trials_timeline}
        },
        helper_funcs.expandArray = (arr, times) => arr.map(x => Array(times).fill(x)).flat(),
        helper_funcs.range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
        helper_funcs.string_to_type = function(original_string, new_type) {
            switch (new_type) {
                case 'boolean':
                    return original_string === 'true';
                case 'number':
                    return parseInt(original_string);
                default:
                    return original_string;
            }
        }
        return helper_funcs
    }

    get_trial_generators() {
        let self = this;

        let trial_generators = {}
        trial_generators.previously_completed = function() {
            return {
                type: jsPsychHtmlButtonResponse,
                stimulus: '<p style="font-size: 2em; ">You have previously completed these tasks.</p>',
                choices: ['Back to the Quorum platform'],
                on_finish: function(trial) {
                    window.location = "https://quorumapp.com/"
                }
            }
        }
        trial_generators.media_preloading = function(tasks) {
            return {
                type: jsPsychCallFunction,
                func: () => {
                    for (let task of Object.values(tasks)) {
                        task.media_promises = self.jsPsych.pluginAPI.preloadImages(task.media)
                    }
                }
            }
        }
        trial_generators.wait_for_media_load = function(task) {
            let trial = {
                type: jsPsychHtmlKeyboardResponse,
                stimulus: "Please wait until the next task loads...",
                choices: "NO_KEYS",
                on_load: function() {
                    function end_trial() {
                        clearTimeout(timeout_id)
                        let trial_end = new Date();
                        let seconds_since_trial_start = (trial_end.getTime() - trial_start.getTime()) / 1000;
                        if (seconds_since_trial_start < 2) {
                            self.jsPsych.finishTrial()
                        } else {
                            document.getElementById('jspsych-html-keyboard-response-stimulus').innerHTML = 'Starting in 2 seconds...'
                            self.jsPsych.pluginAPI.setTimeout(function() {
                                self.jsPsych.finishTrial()
                            }, 2000)
                        }
                    }

                    let trial_start = new Date();
                    let timeout_id = setTimeout(function(){
                        document.getElementById('jspsych-html-keyboard-response-stimulus').innerHTML = '<p>The task is taking too long to load...</p><p>Try refreshing the page by using Ctrl + F5 on Windows or Cmd + F5 on Mac. Alternatively, you can try using the same link but in incognito/private mode or in a different browser.</p>'
                    }, 60000);
                    
                    Promise.all(task.media_promises)
                        .then(() => {end_trial()})
                        .catch(() => {
                            // if only some media is loaded from the first try, this will carryover here and won't be reloaded; 
                            // only the failed media will try to be loaded
                            let new_media_promises = self.jsPsych.pluginAPI.preloadImages(task.media)
                            Promise.all(new_media_promises)
                                .then(() => {end_trial()})
                        })
                }
            }

            let conditional_timeline = {
                timeline: [trial],
                conditional_function: function() {
                    return task.media.length!==0
                }
            }
            return conditional_timeline
        }
        trial_generators.save_session_parameters = function(tasks) {
            return {
                type: jsPsychCallFunction,
                func: function() {},
                on_finish: function(data) {
                    data.trial_name = "session_parameters"
                    data.experiment_parameters = self.settings
                    for (let [task_name, task] of Object.entries(tasks)) {
                        data[`task_${task_name}`] = task.settings
                    }
                    
                }
            }
        }
        trial_generators.add_task_stylesheet = function(task_stylesheet_filename) {
            // a blank screen will flicker just to make sure that the stylesheet is applied correctly before moving on
            return {
                type: jsPsychCallFunction,
                async: true,
                func: function(done) {
                    let stylesheet = document.createElement("link")
                    stylesheet.type = "text/css"; stylesheet.rel = "stylesheet";
                    stylesheet.href = `css/${task_stylesheet_filename}.css`
                    stylesheet.id = `${task_stylesheet_filename}_stylesheet`
                    document.getElementsByTagName("head")[0].appendChild(stylesheet)
                    self.jsPsych.pluginAPI.setTimeout(function() {
                        done();
                    }, 150)
                }
            }
        }
        trial_generators.remove_task_stylesheet = function(task_stylesheet_filename) {
            return {
                type: jsPsychCallFunction,
                func: () => {
                    let stylesheet = document.querySelector(`#${task_stylesheet_filename}_stylesheet`)
                    stylesheet.parentNode.removeChild(stylesheet)
                }
            }
        }
        trial_generators.fixation_cross = function(duration=300) {
            return {
                type: jsPsychHtmlKeyboardResponse,
                stimulus: '<div class="fixation-cross">+</div>',
                trial_duration: self.settings.SIMULATE ? 0 : duration,
                choices: "NO_KEYS",
                on_finish: function(data) {
                    data.trial_name = 'fixation_cross'
                }
            }
        }
        trial_generators.welcome = function() {
            return {
                type: jsPsychInstructions,
                pages: function() {
                    return [`<p class="instructions-title" style="text-align: center">Welcome to the study!</p>
                            <p>In this study, you will complete a bunch of different decision-making tasks.</p>
                            <p>Most of the time, you will have a <b>timer</b> in the upper right corner of the screen indicating the maximum time you can spend on the current page or set of pages. Make sure you do not go over that limit. This helps us ensure that different people have similar experiences during the study.</p>
                            <p>Every 15 minutes or so, as you move from one task to the next, you will have the option to take a <b>break</b>. This break won't be timed and you can take as much time as you want. You will NOT be compensated for that time.</p>
                            <p>Every time a new tasks starts, you will see a <b>progress bar</b> on the left that indicates how far you've got.</p>
                            <p style="text-align: center; font-weight: bold;">Let's get started!</p>`
                            ]
                },
                allow_backward: false,
                show_clickable_nav: true,
                css_classes: ['instructions_width', 'instructions_left_align'],
                simulate: false
            }
        }
        trial_generators.fullscreen = function() {
            return {
                type: jsPsychFullscreen,
                full_screen_mode: true,
                message: [`<p>Before we start, we need to make sure you see the stimuli in full size.</p>
                        <p>In order to do that, please enter into full screen mode by pressing the button below.</p>`],
                button_label: 'Enter full screen and continue with the experiment.',
                css_classes: ['instructions_width'],
                on_finish: function(data) {
                    if (data.success === true) {
                        self.jsPsych.data.addProperties({
                            FULLSCREEN_SCREEN_WIDTH: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                            FULLSCREEN_SCREEN_HEIGHT: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
                        })
                    } else {
                        self.jsPsych.data.addProperties({
                            FULLSCREEN_SCREEN_WIDTH: null,
                            FULLSCREEN_SCREEN_HEIGHT: null
                        })
                    }
                    data.trial_name = "fullscreen"
                }
            }
        }
        trial_generators.browser_check = function(tasks) {
            let min_width=840
            let min_height=500
            let mobile_allowed=true
            for (let task of Object.values(tasks)) {
                min_width = Math.min(task.browser_requirements.min_width, min_width)
                min_height = Math.min(task.browser_requirements.min_height, min_height)
                if (!task.browser_requirements.mobile_allowed) {mobile_allowed = false}
            }
            return {
                type: jsPsychBrowserCheck,
                minimum_width: min_width,
                minimum_height: min_height,
                allow_window_resize: true,
                css_classes: ['instructions_width'],
                inclusion_function: (data) => {
                    if (!mobile_allowed) {
                        return data.mobile === false
                    }
                },
                exclusion_message: (data) => {
                    save_session_restart_info(self.session_info, data)

                    let exclusion_message = '<p>Your browser did not meet the necessary checks to continue with this experiment.</p>'

                    if (!mobile_allowed) {
                        if (data.mobile) {
                            exclusion_message = '<p>You must use a desktop/laptop computer to participate in this experiment.</p>';
                        }
                    }

                    return exclusion_message                 
                },
                on_finish: function(data) {
                    data.trial_name = "browser_check"
                }
            }
        }
        trial_generators.break_between_tasks = function() {
            let break_trial = {
                type: jsPsychInstructions,
                pages: function() {
                    return [`<p class="instructions-title" style="text-align: center">TIME FOR A BREAK</p>
                    <p>You can take a break now and come back to the survey anytime to do the next tasks.</p>
                    <p>Whenever you are ready to continue, just press the "Continue" button below.</p>`]
                },
                button_label_next: "Continue",
                css_classes: ['instructions_width', 'instructions_left_align'],
                allow_backward: false,
                show_clickable_nav: true,
                on_finish: function(data) {
                    data.trial_name = "break_trial"
                }
            }
            let break_timeline = {
                timeline: [break_trial],
                conditional_function: function() {
                    const ms_between_breaks = 900000 // 15 minutes
                    let last_break_trial = self.jsPsych.data.get().filter({trial_name: "break_trial"}).last(1).values()
                    let last_trial = self.jsPsych.data.get().last(1).values()[0]
                    // if we've never had a break, just check if time has passed, otherwise, check time passed relative to last break
                    if (last_break_trial.length==0) {
                        return last_trial.time_elapsed > ms_between_breaks
                    } else {
                        return last_trial.time_elapsed - last_break_trial[0].time_elapsed > ms_between_breaks
                    }
                }
            }
            return break_timeline
        }
        trial_generators.get_task_feedback = function(task_prettyname) {
            return {
                type: jsPsychHtmlButtonResponse,
                stimulus: `
                    <p class="instructions-title">Feedback?</p>
                    <p>If something went wrong during the last task or you think we can improve it, please leave any and all comments you have here.</p>
                    <div style="margin-bottom: 3vh">
                        <textarea id="task_feedback" style="width: 50vw; height: 15vh;"></textarea>
                    </div>
                `, 
                choices: ["Continue >>"],
                data: {trial_name: `feedback_${task_prettyname}`, response: ""},
                on_load: function() {
                    let that = this
                    let text_area = document.querySelector("textarea#task_feedback")
                    text_area.addEventListener("input", (event) => {
                        that.data.response = event.target.value
                    })
                },
                css_classes: ['content_size']
            }
        }
        trial_generators.exclusion_timeline = function(exclusion_criteria) {
            let rejection_trial = {
                type: jsPsychInstructions,
                pages: function() {
                    return [`<p>Thank you for your time and effort to get to this stage.</p>
                            <p>The program has reviewed your response, however, it does not meet the criteria to continue with the experiment because ${self.jsPsych.timelineVariable('exclusion_reason_text', true)}. As a result, we cannot continue with this experiment and have to terminate early.</p>`
                            ]
                },
                allow_backward: false,
                show_clickable_nav: true,
                simulate: false
            }

            let exclusion_timeline = {
                timeline: [rejection_trial, trial_generators.debrief()],
                conditional_function: function() {
                    for(let i = 0; i < exclusion_criteria.length; i++) {
                        if (exclusion_criteria[i].exclusion_condition()) {
                            this.timeline_variables = exclusion_criteria[i].timeline_variables
                            return true;
                        }
                    }
                    return false;
                }
            };
            return exclusion_timeline;
        }
        trial_generators.async_data_save = function(data_checkpoint, tasks=null) {
            return {
                type: jsPsychHtmlKeyboardResponse,
                stimulus: "",
                choices: "NO_KEYS",
                on_load: function() {
                    self.jsPsych.finishTrial()
                },
                on_finish: function(data) {
                    data.trial_name = "async_data_save"
                    data.data_checkpoint = data_checkpoint
                    data.data_checkpoint_ind = self.saved_progress.last_data_checkpoint_ind + self.jsPsych.data.get().filter({trial_name: "async_data_save"}).count()-1
                    if (self.saved_progress.last_data_checkpoint_ind !== 0) {
                        data.data_checkpoint_ind += 1
                    }
                    self.session_info.data_checkpoint_ind = data.data_checkpoint_ind

                    const last_async_data_save = self.jsPsych.data.get().filter({trial_name: "async_data_save"}).values()
                    let data_to_save
                    let interaction_data_to_save
                    if (last_async_data_save.length == 1) {
                        data_to_save = self.jsPsych.data.get().values()
                        interaction_data_to_save = self.jsPsych.data.getInteractionData().values()
                    } else {
                        const last_async_data_save_trial_index = last_async_data_save.slice(-2)[0].trial_index
                        data_to_save = self.jsPsych.data.get().filterCustom(function(trial) {return trial.trial_index > last_async_data_save_trial_index}).values()
                        interaction_data_to_save = self.jsPsych.data.getInteractionData().filterCustom(function(trial) {return trial.trial > last_async_data_save_trial_index}).values()
                    }

                    save_data_json(self.session_info.session_id, data_checkpoint, data.data_checkpoint_ind, data_to_save, interaction_data_to_save)                
                }
            }
        }
        trial_generators.wait_for_data_save = function() {
            return {
                type: jsPsychHtmlKeyboardResponse,
                stimulus: "<p>Please wait until your data are saved.</p><p style='font-size: 2em; color: red'>Do NOT close this window!</p><p>The experiment will automatically continue once the data are saved.</p>",
                choices: "NO_KEYS",
                on_load: function() {
                    const data = self.jsPsych.data.get().values()
                    let promises = save_data_backup(self.session_info, data)
                    Promise.all(promises).then(results => {
                        self.jsPsych.finishTrial()
                    }).catch(error => {
                        document.querySelector("#jspsych-html-keyboard-response-stimulus").innerHTML = `<p style='font-size: 2em; color: red'>There was an error while saving your data. Please contact the experimenter.</p>`
                        console.error("Some chunks failed after retries: ", error);
                    });
                }
            }
        }
        trial_generators.debrief = function() {
            const debrief_text = `
                <p class="instructions-title">Thank you for completing this study.</p>
                <p><b>Please click on the button below to register your response.</b></p>
            `
            return {
                type: jsPsychInstructions,
                pages: function() {
                    let html = `${debrief_text}`
                    html += `<a id="exit_button" target="_blank"><button class="jspsych-btn" style="font-size: 2em;">Exit experiment</button></a>`
                    return [html]
                },
                on_load: function() {
                },
                allow_keys: false,
                show_clickable_nav: false,
                allow_backward: false,
                simulation_options: {
                    simulate: false
                },
                css_classes: ['instructions_width'],
                on_finish: function(data) {
                }
            }
        }
        return trial_generators
    }

    initialize_progressbar(tasks) {
        document.querySelector("#progress-container").style.visibility = "visible"
        this.progress = {
            current_duration_mins: 0,
            total_duration_mins: this.settings.SKIP_INTRO_TRIALS ? 0 : 2
        }
        for (let [task_name, task] of Object.entries(tasks)) {
            this.progress.total_duration_mins += task.duration_mins
        }
    }

    update_progress_bar(mins) {
        let that = this;

        return {
            type: jsPsychCallFunction,
            func: () => {
                that.progress.current_duration_mins += mins
                let percent = Math.round(that.progress.current_duration_mins / that.progress.total_duration_mins * 100)
                // this might need to be checked better
                if (percent > 100) {percent = 100}

                document.querySelector("#progress-container").style.visibility = "visible"
                document.querySelector("#progress-bar").style.height = `${percent}%`
                document.querySelector("#progress-text").innerHTML = `${percent}%`
            }
        }
    }

    hide_progress_bar() {
        return {
            type: jsPsychCallFunction,
            func: () => {
                document.querySelector("#progress-container").style.visibility = "hidden"
            }
        }
    }
}