export default class Cognitive_Reflection {
    constructor(jsPsych, Experiment, task_query_string) {
        this.duration_mins = 5
        this.prettyname = "Cognitive Reflection"
        this.browser_requirements = {min_width: 840, min_height: 500, mobile_allowed: false}
        this.media = []
        this.media_promises = []
        this.exclusion_criteria = []
        
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
            {
                id: "crt_1",
                prompt: "<b>Q1</b>. A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
                options: ["5 cents", "10 cents", "9 cents", "1 cent"]
            },
            {
                id: "crt_2",
                prompt: "<b>Q2</b>. If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
                options: ["5 minutes", "100 minutes", "20 minutes", "500 minutes"]
            },
            {
                id: "crt_3",
                prompt: "<b>Q3</b>. In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days for the patch to cover the entire lake, how long would it take for the patch to cover half of the lake?",
                options: ["47 days", "24 days", "12 days", "36 days"]
            },
            {
                id: "crt_4",
                prompt: "<b>Q4</b>. If John can drink one barrel of water in 6 days, and Mary can drink one barrel of water in 12 days, how long would it take them to drink one barrel of water together?",
                options: ["4 days", "9 days", "12 days", "3 days"]
            },
            {
                id: "crt_5",
                prompt: "<b>Q5</b>. Jerry received both the 15th highest and the 15th lowest mark in the class. How many students are in the class?",
                options: ["29 students", "30 students", "1 student", "15 students"]
            },
            {
                id: "crt_6",
                prompt: "<b>Q6</b>. A man buys a pig for $60, sells it for $70, buys it back for $80, and sells it finally for $90. How much has he made?",
                options: ["20 dollars", "10 dollars", "0 dollars", "30 dollars"]
            },
            {
                id: "crt_7",
                prompt: "<b>Q7</b>. Simon decided to invest $8,000 in the stock market one day early in 2008. Six months after he invested, on July 17, the stocks he had purchased were down 50%. Fortunately for Simon, from July 17 to October 17, the stocks he had purchased went up 75%. At this point, Simon:",
                options: ["has lost money.", "is ahead of where he began.", "has broken even in the stock market.", "it cannot be determined."]
            }
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

        self.test_trial = {
            type: jsPsychSurveyMultiChoice,
            preamble: "<b>Instructions</b>: You will see on this page several items that vary in difficulty. Answer to the best of your ability.<hr>", 
            questions: function() {
                return self.settings.DATA.map(d => {
                    return {
                        name: d.id,
                        prompt: d.prompt,
                        options: d.options,
                        horizontal: true,
                        required: !(self.Experiment.settings.IGNORE_VALIDATION)
                    }
                })
            },
            on_load: function() {
            },
            timer: 280,
            css_classes: ['content_size'],
            on_finish: function(data) {
                data.trial_name = "cognitive_reflection_test_trial"
                for (const [k,v] of Object.entries(data.response)) {
                    data[k] = typeof data.response[k] === undefined ? "" : data.response[k]
                }
            }//,
            // simulation_options: 'cognitive_reflection_test_trial'
        }
    }

    get_timeline() {
        let timeline = []
        if (this.Experiment.saved_progress.data_checkpoints.includes(`${this.prettyname}__completed`)) {
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
        } else {
            timeline.push(this.Experiment.trial_generators.wait_for_media_load(this))
            timeline.push(this.Experiment.trial_generators.add_task_stylesheet("cognitive_reflection_task"))
            if (this.Experiment.settings.INSTRUCTIONS_ONLY) {
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Cognitive reflection - no instructions only trials as it is a single trial only. Showing full trial instead.'], show_clickable_nav: true})
                timeline.push(this.test_trial)
            } else {
                timeline.push(this.Experiment.hide_progress_bar())
                timeline.push(this.test_trial)
            }
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
            timeline.push(this.Experiment.trial_generators.get_task_feedback(this.prettyname))
            timeline.push(this.Experiment.trial_generators.remove_task_stylesheet("cognitive_reflection_task"))
            timeline.push(this.Experiment.trial_generators.exclusion_timeline(this.exclusion_criteria))
            timeline.push(this.Experiment.trial_generators.async_data_save(`${this.prettyname}__completed`))
        }
        return {timeline: timeline}
    }
}