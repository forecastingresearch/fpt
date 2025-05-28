export default class Shipley_Abstraction {
    constructor(jsPsych, Experiment, task_query_string) {
        this.prettyname = "Shipley (Abstraction)"
        this.duration_mins = 12
        this.browser_requirements = {min_width: 840,min_height: 500, mobile_allowed: false}
        this.exclusion_criteria = []
        this.media = ["img/instructions/shipley_abstraction_example.png"]
        this.media_promises = []
        
        this.jsPsych = jsPsych;
        this.Experiment = Experiment;

        this.modifiable_settings = this.get_modifiable_settings();
        this.default_settings = this.get_default_settings();
        this.settings = this.get_updated_settings_from_query(task_query_string);
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
            {id: "shipley_abstraction_0", html: "<span>big   little</span><span>high   low</span><span>cold   {INPUT} {INPUT} {INPUT}</span>", correct: ["h", "o", "t"]},
            {id: "shipley_abstraction_0", html: "<span>1</span><span>3</span><span>5</span><span>{INPUT}</span><span>9</span>", correct: ["7"]},
        ]
    
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

    define_trials() {
        // it's quite common to refer to both the current trial context so this causes context conflict for the this keyword
        // therefore, for this method we will use self to refer to the class and this will be for whatever the current context is
        let self = this;

        self.general_instructions = {
            type: jsPsychInstructions,
            pages: [`<p class="instructions-title" style="text-align: center">Complete the sequence</p>
                    <p>In this task, you have to fill in the missing letter, number of word to complete each sequence.</p>
                    <p>Write only one character in each blank space.</p>
                    <p>Example:</p>
                    <div style="width: 90%; margin: auto;"><img style="width: 100%; border: 2px solid black;" src="img/instructions/shipley_abstraction_example.png"/></div>
                    <p style="font-size: 0.6em"><b>Copyright notice</b>: Material from the Shipley-2 copyright © 2009, by Western Psychological Services. Format adapted by E. Karger,
                    Forecasting Research Institute for specific, limited research use for their study, "The Forecasting Proficiency Test" under
                    license of the publisher, WPS (rights@wpspublish.com). No additional reproduction, in whole or in part, by any medium or
                    for any purpose, may be made without the prior, written authorization of WPS. All rights reserved.</p>`
            ],
            show_clickable_nav: true,
            allow_backward: false,
            allow_keys: false,
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 60,
            on_finish: function(data) {
                data.trial_name = "shipley_abstraction_instructions"
            }
        }

        self.test_trial = {
            type: jsPsychSurveyHtmlForm,
            // preamble: '',
            html: function() {
                let html = ''

                for (let content of self.settings.DATA) {
                    let html_rendered = content.html

                    html_rendered = html_rendered.replaceAll(" ", "&nbsp;")

                    let input_counter = 0;
                    while (html_rendered.includes("{INPUT}")) {
                        html_rendered = html_rendered.replace("{INPUT}", `<input type="text" required="${!(self.Experiment.settings.IGNORE_VALIDATION)}" name="${content.id}_${input_counter++}">`);
                    }

                    html += `<div class="question_container">
                                <div class="index"><b>${content.id.split("_").slice(-1)[0]}.</b></div>
                                <div class="question">${html_rendered}</div>
                            </div>`
                }

                return html
            },
            css_classes: ['content_size'],
            timer: 720,
            on_load: function() {
                if (self.Experiment.settings.IGNORE_VALIDATION) {
                    document.querySelectorAll("input").forEach(e=>e.required=false)
                }

                if (self.Experiment.settings.SIMULATE) {
                    // next_button.disabled = false;
                    document.querySelectorAll("input").forEach(e=>e.required=false)

                    const get_random_char = () => {
                        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                        return chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    
                    let valid_text_responses_n = self.jsPsych.randomization.sampleWithoutReplacement([document.querySelectorAll(`input[type="text"]`).length-15, document.querySelectorAll(`input[type="text"]`).length], 1)[0]
                    let text_responses = self.jsPsych.randomization.sampleWithoutReplacement(Array.from(document.querySelectorAll(`input[type="text"]`)), valid_text_responses_n)
                    text_responses.forEach(e=>e.value=get_random_char())
                }
            },
            on_finish: function(data) {
                data.trial_name = "shipley_abstraction_test_trial"

                let score = 0
                for (let question_data of self.settings.DATA) {
                    let curr_question_all_correct_flag = true
                    for (let char_index=0; char_index<question_data.correct.length; char_index++) {
                        if (data.response[`${question_data.id}_${char_index}`] !== question_data.correct[char_index]) {
                            curr_question_all_correct_flag = false
                            break
                        }
                    }
                    if (curr_question_all_correct_flag) {
                        score++
                    }
                }
                data.shipley_abstraction_score = score
            }
        }
    }

    get_timeline() {
        let timeline = []
        if (this.Experiment.saved_progress.data_checkpoints.includes(`${this.prettyname}__completed`)) {
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
        } else {
            timeline.push(this.Experiment.trial_generators.wait_for_media_load(this))
            timeline.push(this.Experiment.trial_generators.add_task_stylesheet("shipley_abstraction_task"))
            if (this.Experiment.settings.INSTRUCTIONS_ONLY) {
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Shipley (abstraction) - instructions'], show_clickable_nav: true})
                timeline.push(this.general_instructions)
            } else {
                timeline.push(this.general_instructions)
                timeline.push(this.Experiment.hide_progress_bar())
                timeline.push(this.test_trial)
            }
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
            timeline.push(this.Experiment.trial_generators.get_task_feedback(this.prettyname))
            timeline.push(this.Experiment.trial_generators.remove_task_stylesheet("shipley_abstraction_task"))
            timeline.push(this.Experiment.trial_generators.exclusion_timeline(this.exclusion_criteria))
            timeline.push(this.Experiment.trial_generators.async_data_save(`${this.prettyname}__completed`))
        }
        return {timeline: timeline}
    }
}