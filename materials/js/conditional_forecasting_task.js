export default class Conditional_Forecasting {
    constructor(jsPsych, Experiment, task_query_string) {
        this.duration_mins = 5
        this.prettyname = "Conditional Forecasting"
        this.browser_requirements = {min_width: 840, min_height: 500, mobile_allowed: false}
        this.media = []
        this.media_promises = []
        this.exclusion_criteria = []
        
        this.jsPsych = jsPsych;
        this.Experiment = Experiment;

        this.modifiable_settings = this.get_modifiable_settings();
        this.default_settings = this.get_default_settings();
        this.settings = this.get_updated_settings_from_query(task_query_string);
        // this.task_data = this.get_task_data();
        this.set_cond_forecast_content();
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

    // get_task_data() {
    //     // each value for pt_trials and test_trials is an object, whose keys are the trial key (trial_001)
    //     // and values are objects with key-value pairs representing curr trial variable name-curr trial variable value
    //     // e.g. {'test_trials': 
    //     //			 {'trial_001': {
    //     //			 	'pt_trial': true, 
    //     //			 	'block': 0,
    //     //			 	'trial': 5,
    //     //			 	'myvar': 'myval'
    //     //			 }, 'trial_002': {...}}}
    //     const task_data = {'pt_trials': {}, 'test_trials': {}} 
    //     return task_data
    // }

    define_trials() {
        // it's quite common to refer to both the current trial context so this causes context conflict for the this keyword
        // therefore, for this method we will use self to refer to the class and this will be for whatever the current context is
        let self = this;

        function check_all_sliders_moved(all_sliders) {
            for (const slider in all_sliders) {
                if (!all_sliders[slider]) return false;
            }
            return true;
        }
        
        function handle_slider_change(trial_obj, slider_id, all_sliders, next_button) {
            all_sliders[slider_id] = true
            if (!trial_obj.data.moved_sliders.includes(slider_id)) {trial_obj.data.moved_sliders += `${slider_id},`};
            if (check_all_sliders_moved(all_sliders)) {
                document.querySelector("#slider_text").style.visibility = "hidden";
                next_button.disabled = false
            }
        }

        self.general_instructions = {
            type: jsPsychInstructions,
            pages: [`<p><u><b>Instructions</b></u></p>
                    <p>On the following pages, you will be asked to ...</p>
                    `],
            show_clickable_nav: true,
            allow_backward: false,
            css_classes: ['instructions_width'],
            timer: 60,
            on_finish: function(data) {
                data.trial_name = "condforecast_instructions"
            }
        }

        self.create_trial = function(block) {
            return {
                type: jsPsychSurveyHtmlForm,
                // preamble: '<p><b>A. The following questions ask about events that may happen some time during the <i>next year</i></b></p>',
                html: function() {
                    let html = ''
                    self.settings.COND_FORECAST_ITEMS.filter(e=>e.block===block).forEach(e => {
                        if (block === 1) {
                            html += `<div class="statement-slider">${e.statement}</div>
                                    <div class="slider-labels-container">
                                    <input name="${e.id}" id="${e.id}_slider" type="range" min="0" max="100" step="1" value="0" class="jspsych-slider" style="width: 100%">
                                    <div class="labels-container">
                                        <div style="left: calc(0% - (10%/2) - -7.5px);"><span>0%<br>no chance</span></div>
                                        <div style="left: calc(10% - (10%/2) - -6px);"><span>10%</span></div>
                                        <div style="left: calc(20% - (10%/2) - -4.5px);"><span>20%</span></div>
                                        <div style="left: calc(30% - (10%/2) - -3px);"><span>30%</span></div>
                                        <div style="left: calc(40% - (10%/2) - -1.5px);"><span>40%</span></div>
                                        <div style="left: calc(50% - (10%/2) - 0px);"><span>50%</span></div>
                                        <div style="left: calc(60% - (10%/2) - 1.5px);"><span>60%</span></div>
                                        <div style="left: calc(70% - (10%/2) - 3px);"><span>70%</span></div>
                                        <div style="left: calc(80% - (10%/2) - 4.5px);"><span>80%</span></div>
                                        <div style="left: calc(90% - (10%/2) - 6px);"><span>90%</span></div>
                                        <div style="left: calc(100% - (10%/2) - 7.5px);"><span>100%<br>certainty</span></div>
                                    </div>
                                </div>`
                        } else {
                            html += `<div class="statement-text">${e.statement}</div>
                                    <div>
                                        <input style="width: 15%" type="text" required="true" name="${e.id}"/> ${e.id.includes("C3") ? "$" : "%"}
                                    </div>`
                        }
                    })
                    if (block===1) {html += `<p id="slider_text" style="text-align: center"><i>Move all sliders to continue.</i></p>`}
                    return html
                },
                on_load: function() {
                    let that = this;

                    if (self.Experiment.settings.IGNORE_VALIDATION) {
                        document.querySelectorAll("input").forEach(e=>e.required=false)
                    }

                    let next_button = document.querySelector("#jspsych-survey-html-form-next")
                    if (block===1) {
                        if (!(self.Experiment.settings.IGNORE_VALIDATION === true)) {
                        next_button.disabled = true
            
                        
                            let sliders_moved = {}
                            document.querySelectorAll(`input[type="range"]`).forEach(e=>{
                                sliders_moved[e.id] = false
                                // these 3 event listeners might be replaced by a single 'input' one
                                // but in this case we are just preserving the jsPsych style as per plugin-html-slider-response.js
                                e.addEventListener("mousedown", () => handle_slider_change(that, e.id, sliders_moved, next_button))
                                e.addEventListener("touchstart", () => handle_slider_change(that, e.id, sliders_moved, next_button))
                                e.addEventListener("change", () => handle_slider_change(that, e.id, sliders_moved, next_button))
                            })
                        }
                    }
            
                    if (self.Experiment.settings.SIMULATE) {
                        next_button.disabled = false;
                        // let n_sliders_to_move = self.Experiment.simulation_options[this.simulation_options].data.valid_responses_n
                        // let sliders_to_move = self.jsPsych.randomization.sampleWithoutReplacement(Array.from(document.querySelectorAll(`input[type="range"]`)), n_sliders_to_move)
                        let sliders_to_move = Array.from(document.querySelectorAll(`input[type='text'], input[type='range']`))
                        sliders_to_move.forEach(e=>e.value=self.jsPsych.randomization.randomInt(0, 100))
                    }
                },
                data: {moved_sliders: ""},
                timer: self.settings.COND_FORECAST_ITEMS.filter(e=>e.block===block).length * 30,
                css_classes: ['content_size'],                
                on_finish: function(data) {
                    data.trial_name = "condforecast_test_trial"
                    data.cond_forecast_id = typeof data.response !== "undefined" ? Object.keys(data.response) : null
                    data.cond_forecast_response = typeof data.response !== "undefined" ? Object.values(data.response) : null
                }
            };
        }

        // self.test_trial = 
    }

    get_timeline() {
        let timeline = []
        if (this.Experiment.saved_progress.data_checkpoints.includes(`${this.prettyname}__completed`)) {
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
        } else {
            timeline.push(this.Experiment.trial_generators.wait_for_media_load(this))
            timeline.push(this.Experiment.trial_generators.add_task_stylesheet("conditional_forecasting_task"))
            if (this.Experiment.settings.INSTRUCTIONS_ONLY) {
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Conditinal Forecasting scale instructions.'], show_clickable_nav: true})
                timeline.push(this.general_instructions)
            } else {
                timeline.push(this.general_instructions)
                timeline.push(this.Experiment.hide_progress_bar())
                for (let block of [...new Set(this.settings.COND_FORECAST_ITEMS.map(item => item.block))]) {
                    timeline.push(this.create_trial(block))
                }
            }
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
            timeline.push(this.Experiment.trial_generators.get_task_feedback(this.prettyname))
            timeline.push(this.Experiment.trial_generators.remove_task_stylesheet("conditional_forecasting_task"))
            timeline.push(this.Experiment.trial_generators.exclusion_timeline(this.exclusion_criteria))
            timeline.push(this.Experiment.trial_generators.async_data_save(`${this.prettyname}__completed`))
        }
        return {timeline: timeline}
    }

    set_cond_forecast_content() {
        this.settings.COND_FORECAST_ITEMS = [
            {id: 'B1', block: 1, statement: 'On November 6, 2024, what is the probability the Democrats will hold a majority in the U.S. House of Representatives?'},
            {id: 'B2', block: 1, statement: 'Before November 6, 2024, what is the probability  the U.S. Department of Health and Human Services will declare a new <a href="https://aspr.hhs.gov/legal/PHE/Pages/default.aspx" target="_blank">National Public Health Emergency</a>?'},
            {id: 'B3', block: 1, statement: 'Before November 6, 2024, what is the probability the U.S. <a href="https://www.nber.org/research/business-cycle-dating" target="_blank">National Bureau of Economic Research will declare a new recession</a>?'},
            {id: 'C1', block: 2, statement: 'What will the U.S. Unemployment Rate be on April 6, 2025?'},
            {id: 'C2', block: 2, statement: 'What will the U.S. Presidential Approval Rating be on April 6, 2025?'},
            {id: 'C3', block: 2, statement: 'What will be the total gross of the top grossing movie the first weekend of April, 2025?'},
            {id: "B1aC1", block: 3, statement: 'Given that the Democrats hold a majority in the U.S. House of Representatives on November 6, 2024, what will be the U.S. Unemployment Rate on April 6, 2025?'},
            {id: "B1aC2", block: 3, statement: 'Given that the Democrats hold a majority in the U.S. House of Representatives on November 6, 2024, what will be the U.S. Presidential Approval Rating be on April 6, 2025?'},
            {id: "B1aC3", block: 3, statement: 'Given that the Democrats hold a majority in the U.S. House of Representatives on November 6, 2024, what will be the total gross of the top grossing movie the first weekend of April, 2025?'},
            {id: "B1bC1", block: 4, statement: 'Given that the Democrats <b>do not</b> hold a majority in the U.S. House of Representatives on November 6, 2024, what will be the U.S. Unemployment Rate on April 6, 2025?'},
            {id: "B1bC2", block: 4, statement: 'Given that the Democrats <b>do not</b> hold a majority in the U.S. House of Representatives on November 6, 2024, what will be the U.S. Presidential Approval Rating be on April 6, 2025?'},
            {id: "B1bC3", block: 4, statement: 'Given that the Democrats <b>do not</b> hold a majority in the U.S. House of Representatives on November 6, 2024, what will be the total gross of the top grossing movie the first weekend of April, 2025?'},
            {id: "B2aC1", block: 5, statement: 'Given that the U.S. Department of Health and Human Services declares a new <a href="https://aspr.hhs.gov/legal/PHE/Pages/default.aspx" target="_blank">National Public Health Emergency</a> before November 6, 2024, what will be the U.S. Unemployment Rate on April 6, 2025?'},
            {id: "B2aC2", block: 5, statement: 'Given that the U.S. Department of Health and Human Services declares a new <a href="https://aspr.hhs.gov/legal/PHE/Pages/default.aspx" target="_blank">National Public Health Emergency</a> before November 6, 2024, what will be the U.S. Presidential Approval Rating be on April 6, 2025?'},
            {id: "B2aC3", block: 5, statement: 'Given that the U.S. Department of Health and Human Services declares a new <a href="https://aspr.hhs.gov/legal/PHE/Pages/default.aspx" target="_blank">National Public Health Emergency</a> before November 6, 2024, what will be the total gross of the top grossing movie the first weekend of April, 2025?'},
            {id: "B2bC1", block: 6, statement: 'Given that the U.S. Department of Health and Human Services <b>does not declare</b> a new <a href="https://aspr.hhs.gov/legal/PHE/Pages/default.aspx" target="_blank">National Public Health Emergency</a> before November 6, 2024, what will be the U.S. Unemployment Rate on April 6, 2025?'},
            {id: "B2bC2", block: 6, statement: 'Given that the U.S. Department of Health and Human Services <b>does not declare</b> a new <a href="https://aspr.hhs.gov/legal/PHE/Pages/default.aspx" target="_blank">National Public Health Emergency</a> before November 6, 2024, what will be the U.S. Presidential Approval Rating be on April 6, 2025?'},
            {id: "B2bC3", block: 6, statement: 'Given that the U.S. Department of Health and Human Services <b>does not declare</b> a new <a href="https://aspr.hhs.gov/legal/PHE/Pages/default.aspx" target="_blank">National Public Health Emergency</a> before November 6, 2024, what will be the total gross of the top grossing movie the first weekend of April, 2025?'},
            {id: "B3aC1", block: 7, statement: 'Given that the U.S. <a href="https://www.nber.org/research/business-cycle-dating" target="_blank">National Bureau of Economic Research declares a new recession</a> before November 6, 2024, what will be the U.S. Unemployment Rate on April 6, 2025?'},
            {id: "B3aC2", block: 7, statement: 'Given that the U.S. <a href="https://www.nber.org/research/business-cycle-dating" target="_blank">National Bureau of Economic Research declares a new recession</a> before November 6, 2024, what will be the U.S. Presidential Approval Rating be on April 6, 2025?'},
            {id: "B3aC3", block: 7, statement: 'Given that the U.S. <a href="https://www.nber.org/research/business-cycle-dating" target="_blank">National Bureau of Economic Research declares a new recession</a> before November 6, 2024, what will be the total gross of the top grossing movie the first weekend of April, 2025?'},
            {id: "B3bC1", block: 8, statement: 'Given that the U.S. <a href="https://www.nber.org/research/business-cycle-dating" target="_blank">National Bureau of Economic Research <b>does not</b> declare a new recession</a> before November 6, 2024, what will be the U.S. Unemployment Rate on April 6, 2025?'},
            {id: "B3bC2", block: 8, statement: 'Given that the U.S. <a href="https://www.nber.org/research/business-cycle-dating" target="_blank">National Bureau of Economic Research <b>does not</b> declare a new recession</a> before November 6, 2024, what will be the U.S. Presidential Approval Rating be on April 6, 2025?'},
            {id: "B3bC3", block: 8, statement: 'Given that the U.S. <a href="https://www.nber.org/research/business-cycle-dating" target="_blank">National Bureau of Economic Research <b>does not</b> declare a new recession</a> before November 6, 2024, what will be the total gross of the top grossing movie the first weekend of April, 2025?'}
        ]
    }
}